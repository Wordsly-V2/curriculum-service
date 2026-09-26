import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { cacheKeys } from '@/cache/cache-keys';
import { CacheKind } from '@/cache/cache-ttl';
import { CacheService } from '@/cache/cache.service';
import { type WorkingCopy, rowsToCorpus } from '@/content/content-rows';
import { PATH_ITEMS_RETIRED_TOPIC } from '@/messaging/constants';
import { KafkaProducerService } from '@/messaging/kafka-producer.service';
import { PrismaService } from '@/prisma/prisma.service';
import {
    buildRelease,
    chunk,
    RETIRE_BATCH_SIZE,
    retiredItemIds,
} from './release.logic';

type Tx = Prisma.TransactionClient;

/** Serialises publishes, so two admins cannot interleave status flips. */
const PUBLISH_LOCK_KEY = 0x70617468; // 'path'

export interface ReleaseInfo {
    id: string;
    version: number;
}

export interface PublishResult extends ReleaseInfo {
    /** Items the previous release had and this one dropped (archived). */
    retiredItemIds: string[];
}

export interface ReleaseSummary extends ReleaseInfo {
    note: string | null;
    /** Admin's userLoginId; null for the importer. */
    createdBy: string | null;
    createdAt: Date;
    /** The release learners read now. */
    active: boolean;
}

/** The working copy fails the seed rules; nothing was published. */
export class ContentInvalidError extends BadRequestException {
    constructor(readonly errors: string[]) {
        super({ message: 'The working copy is invalid', errors });
    }
}

/**
 * Releases: immutable snapshots of the working copy that learners read.
 * `publish` validates every non-archived row exactly like a seed, marks DRAFT
 * rows PUBLISHED, stores the snapshot and points PathState at it. Rolling back
 * is `activate` on an older release; snapshots are never edited.
 */
@Injectable()
export class ReleaseService {
    private readonly logger = new Logger(ReleaseService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly kafka: KafkaProducerService,
    ) {}

    async publish(options: {
        note?: string;
        /** Admin's userLoginId; omitted for the importer. */
        createdBy?: string;
    }): Promise<PublishResult> {
        const { release, retired } = await this.prisma.$transaction(
            async (tx) => {
                await tx.$executeRaw`SELECT pg_advisory_xact_lock(${PUBLISH_LOCK_KEY}::bigint)`;

                const { corpus, errors } = rowsToCorpus(
                    await this.workingCopy(tx),
                );
                if (errors.length > 0) throw new ContentInvalidError(errors);
                const snapshot = buildRelease(corpus);
                const retired = retiredItemIds(
                    await this.activeItemIds(tx),
                    snapshot.items.map((i) => i.itemId),
                );

                const draft = {
                    where: { status: 'DRAFT' },
                    data: { status: 'PUBLISHED' },
                };
                await tx.stage.updateMany(draft);
                await tx.unit.updateMany(draft);
                await tx.learnItem.updateMany(draft);
                await tx.dialogue.updateMany(draft);
                await tx.lesson.updateMany(draft);
                await tx.checkpoint.updateMany(draft);

                const release = await tx.release.create({
                    data: { note: options.note, createdBy: options.createdBy },
                });
                const releaseId = release.id;
                await tx.publishedTree.create({
                    data: { releaseId, tree: json(snapshot.tree) },
                });
                await tx.publishedLesson.createMany({
                    data: snapshot.lessons.map((l) => ({
                        releaseId,
                        lessonId: l.lessonId,
                        unitId: l.unitId,
                        payload: json(l.payload),
                    })),
                });
                await tx.publishedCheckpoint.createMany({
                    data: snapshot.checkpoints.map((c) => ({
                        releaseId,
                        checkpointId: c.checkpointId,
                        unitId: c.unitId,
                        payload: json(c.payload),
                    })),
                });
                await tx.publishedItem.createMany({
                    data: snapshot.items.map((i) => ({
                        releaseId,
                        itemId: i.itemId,
                        payload: json(i.payload),
                    })),
                });
                await this.point(tx, releaseId, options.createdBy);

                this.logger.log(
                    `Published release v${release.version}: ` +
                        `${snapshot.lessons.length} lessons, ${snapshot.items.length} items` +
                        (retired.length > 0
                            ? `, ${retired.length} retired`
                            : ''),
                );
                return { release, retired };
            },
            { timeout: 120_000 },
        );

        await this.cache.delGlobal(...cacheKeys.activeRelease);
        await this.sendRetired(release.version, retired);
        return {
            id: release.id,
            version: release.version,
            retiredItemIds: retired,
        };
    }

    /**
     * After the commit, so learning-service never drops progress for a publish
     * that rolled back. A failed send is logged, not thrown: the release is
     * live, and learning-service already hides unpublished items from reviews
     * (filter-published), so the cards only linger until an operator replays.
     */
    private async sendRetired(
        version: number,
        itemIds: string[],
    ): Promise<void> {
        if (itemIds.length === 0) return;
        try {
            await this.kafka.sendBatch(
                PATH_ITEMS_RETIRED_TOPIC,
                chunk(itemIds, RETIRE_BATCH_SIZE).map((batch) => ({
                    itemIds: batch,
                })),
            );
        } catch (error) {
            this.logger.error(
                `Release v${version}: could not send ${PATH_ITEMS_RETIRED_TOPIC} ` +
                    `for ${JSON.stringify(itemIds)}: ${String(error)}`,
            );
        }
    }

    /** Item ids of the release learners have now; empty before the first. */
    private async activeItemIds(tx: Tx): Promise<string[]> {
        const state = await tx.pathState.findUnique({ where: { id: 1 } });
        if (!state?.activeReleaseId) return [];
        const rows = await tx.publishedItem.findMany({
            where: { releaseId: state.activeReleaseId },
            select: { itemId: true },
        });
        return rows.map((r) => r.itemId);
    }

    /** Makes an existing release the one learners see (rollback or roll forward). */
    async activate(
        releaseId: string,
        updatedBy?: string,
    ): Promise<ReleaseInfo> {
        const release = await this.prisma.$transaction(async (tx) => {
            const release = await tx.release.findUnique({
                where: { id: releaseId },
                select: { id: true, version: true },
            });
            if (!release) throw new NotFoundException('Release not found');
            await this.point(tx, release.id, updatedBy);
            return release;
        });

        await this.cache.delGlobal(...cacheKeys.activeRelease);
        this.logger.log(`Activated release v${release.version}`);
        return release;
    }

    /** The release learners read, or null before the first publish. */
    async activeRelease(): Promise<ReleaseInfo | null> {
        return this.cache.getOrSetGlobal(
            cacheKeys.activeRelease,
            async () => {
                const state = await this.prisma.pathState.findUnique({
                    where: { id: 1 },
                });
                if (!state?.activeReleaseId) return null;
                return this.prisma.release.findUnique({
                    where: { id: state.activeReleaseId },
                    select: { id: true, version: true },
                });
            },
            CacheKind.ReleasePointer,
        );
    }

    /** Every release, newest first, with the active one marked. */
    async list(): Promise<ReleaseSummary[]> {
        const [releases, state] = await Promise.all([
            this.prisma.release.findMany({
                orderBy: { version: 'desc' },
                select: {
                    id: true,
                    version: true,
                    note: true,
                    createdBy: true,
                    createdAt: true,
                },
            }),
            this.prisma.pathState.findUnique({ where: { id: 1 } }),
        ]);
        return releases.map((r) => ({
            ...r,
            active: r.id === state?.activeReleaseId,
        }));
    }

    private async point(
        tx: Tx,
        releaseId: string,
        updatedBy: string | undefined,
    ): Promise<void> {
        const data = {
            activeReleaseId: releaseId,
            updatedBy: updatedBy ?? null,
        };
        await tx.pathState.upsert({
            where: { id: 1 },
            create: { id: 1, ...data },
            update: data,
        });
    }

    /**
     * Every row that is not archived, with each lesson's steps and links: what
     * a publish would validate and snapshot.
     */
    async workingCopy(tx: Tx = this.prisma): Promise<WorkingCopy> {
        const where = { status: { not: 'ARCHIVED' } };
        const [stages, units, items, dialogues, lessons, checkpoints] =
            await Promise.all([
                tx.stage.findMany({ where }),
                tx.unit.findMany({ where }),
                tx.learnItem.findMany({ where }),
                tx.dialogue.findMany({ where }),
                tx.lesson.findMany({
                    where,
                    include: { steps: true, items: true },
                }),
                tx.checkpoint.findMany({ where }),
            ]);
        return { stages, units, items, dialogues, lessons, checkpoints };
    }
}

function json(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}
