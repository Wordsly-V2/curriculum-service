import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { contentId } from '@/content/content-id';
import type { SeedRecord } from '@/content/content-records';
import {
    checkpointRowToSeed,
    dialogueRowToSeed,
    itemRowToSeed,
    lessonRowToSeed,
    placementRowToSeed,
    unitRowToRecord,
} from '@/content/content-rows';
import { writeRecord } from '@/content/content-writer';
import type { ContentStatus } from '@/content/content.schema';
import { PrismaService } from '@/prisma/prisma.service';
import { type RowOrigin, rowOrigin } from './admin-path.logic';
import { AdminPathService, type ValidationResult } from './admin-path.service';
import { type AdminKind, parseAdminRecord } from './admin-records';

type Tx = Prisma.TransactionClient;

export interface AdminRecord {
    kind: AdminKind;
    id: string;
    slug: string;
    status: ContentStatus;
    origin: RowOrigin;
    updatedAt: Date;
    /** Admin who last wrote the row; null when the importer did. */
    updatedBy: string | null;
    /** The row in seed shape: what PUT takes back. */
    record: Record<string, unknown>;
}

export interface AdminWriteResult extends AdminRecord {
    /** The whole working copy after this write; a publish needs `ok`. */
    validation: ValidationResult;
}

interface RowMeta {
    id: string;
    slug: string;
    status: string;
    contentHash: string;
    seedHash: string | null;
    updatedAt: Date;
    updatedBy: string | null;
}

/**
 * Admin writes to the working copy. Every write takes the record in seed shape
 * (see admin-records.ts) and goes through the importer's writer, so hashes
 * agree with `content:import`: an admin create has no seed (`seedHash` null),
 * an admin update keeps the row's `seedHash` so the importer still sees the
 * edit. Written rows become DRAFT, since they differ from what learners have.
 * Deleting only archives; nothing is published until a release (P3-3).
 */
@Injectable()
export class AdminContentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly admin: AdminPathService,
    ) {}

    async get(kind: AdminKind, slug: string): Promise<AdminRecord> {
        return this.read(this.prisma, kind, slug);
    }

    async create(
        kind: AdminKind,
        body: unknown,
        adminId: string,
    ): Promise<AdminWriteResult> {
        const seed = this.parse(kind, body);
        await this.prisma.$transaction(async (tx) => {
            if (await this.row(tx, kind, seed.slug)) {
                throw new ConflictException(
                    `${kind} ${seed.slug} already exists`,
                );
            }
            await this.checkReferences(tx, seed);
            await writeRecord(tx, seed, {
                insert: true,
                seedHash: null,
                updatedBy: adminId,
                status: 'DRAFT',
            });
        });
        return this.withValidation(kind, seed.slug);
    }

    async update(
        kind: AdminKind,
        slug: string,
        body: unknown,
        adminId: string,
    ): Promise<AdminWriteResult> {
        const seed = this.parse(kind, body);
        if (seed.slug !== slug) {
            throw new BadRequestException(
                'The slug cannot change: it is the content id. Create a new record instead.',
            );
        }
        await this.prisma.$transaction(async (tx) => {
            const row = await this.requireRow(tx, kind, slug);
            if (row.status === 'ARCHIVED') {
                throw new ConflictException(
                    `${kind} ${slug} is archived; restore it first`,
                );
            }
            // Saving what is already there changes nothing, not even the status.
            if (row.contentHash === seed.hash) return;
            await this.checkReferences(tx, seed);
            await writeRecord(tx, seed, {
                insert: false,
                seedHash: undefined,
                updatedBy: adminId,
                status: 'DRAFT',
            });
        });
        return this.withValidation(kind, slug);
    }

    /** Archives (never deletes): learners' review cards may point at the row. */
    async archive(
        kind: AdminKind,
        slug: string,
        adminId: string,
    ): Promise<AdminWriteResult> {
        await this.prisma.$transaction(async (tx) => {
            const row = await this.requireRow(tx, kind, slug);
            if (row.status === 'ARCHIVED') return;
            if (kind === 'unit') await this.requireEmptyUnit(tx, row.id, slug);
            await this.setStatus(tx, kind, row.id, 'ARCHIVED', adminId);
        });
        return this.withValidation(kind, slug);
    }

    async restore(
        kind: AdminKind,
        slug: string,
        adminId: string,
    ): Promise<AdminWriteResult> {
        await this.prisma.$transaction(async (tx) => {
            const row = await this.requireRow(tx, kind, slug);
            if (row.status !== 'ARCHIVED') return;
            await this.setStatus(tx, kind, row.id, 'DRAFT', adminId);
        });
        return this.withValidation(kind, slug);
    }

    // ─── Helpers ────────────────────────────────────────────────────────────

    private parse(kind: AdminKind, body: unknown): SeedRecord {
        const parsed = parseAdminRecord(kind, body);
        if (!parsed.ok)
            throw new BadRequestException({
                message: 'Invalid record',
                errors: parsed.errors,
            });
        return parsed.seed;
    }

    private async withValidation(
        kind: AdminKind,
        slug: string,
    ): Promise<AdminWriteResult> {
        const [record, validation] = await Promise.all([
            this.read(this.prisma, kind, slug),
            this.admin.validate(),
        ]);
        return { ...record, validation };
    }

    /**
     * What must exist, and not be archived, for the record to make sense on its
     * own. Whole-path rules (introduce once, recycle after) are `validate`'s.
     */
    private async checkReferences(tx: Tx, seed: SeedRecord): Promise<void> {
        const missing: string[] = [];
        const live = { status: { not: 'ARCHIVED' } };

        if (seed.kind === 'unit') {
            const stage = await tx.stage.findFirst({
                where: { slug: seed.record.stage, ...live },
            });
            if (!stage) missing.push(`stage ${seed.record.stage}`);
        } else if (seed.kind === 'placement') {
            // Its units and items are checked by validate, like a lesson's rules.
            const other = await tx.placementTest.findFirst({
                where: { slug: { not: seed.slug }, ...live },
            });
            if (other)
                throw new ConflictException(
                    `placement ${other.slug} is live; archive it first (one placement test at a time)`,
                );
        } else if (seed.kind !== 'stage') {
            const unit = await tx.unit.findFirst({
                where: { slug: seed.record.unit, ...live },
            });
            if (!unit) missing.push(`unit ${seed.record.unit}`);
        }
        if (seed.kind === 'lesson') {
            const slugs = seed.record.items.map((link) => link.item);
            const found = await tx.learnItem.findMany({
                where: { slug: { in: slugs }, ...live },
                select: { slug: true },
            });
            const have = new Set(found.map((i) => i.slug));
            missing.push(
                ...slugs.filter((s) => !have.has(s)).map((s) => `item ${s}`),
            );
        }
        if (seed.kind === 'checkpoint') {
            const other = await tx.checkpoint.findFirst({
                where: {
                    unitId: contentId('unit', seed.record.unit),
                    slug: { not: seed.slug },
                },
            });
            if (other)
                throw new ConflictException(
                    `unit ${seed.record.unit} already has checkpoint ${other.slug}`,
                );
        }
        if (missing.length > 0) {
            throw new BadRequestException({
                message:
                    'The record points at content that is missing or archived',
                errors: missing,
            });
        }
    }

    private async requireEmptyUnit(
        tx: Tx,
        unitId: string,
        slug: string,
    ): Promise<void> {
        const where = { unitId, status: { not: 'ARCHIVED' } };
        const [items, dialogues, lessons, checkpoints] = await Promise.all([
            tx.learnItem.count({ where }),
            tx.dialogue.count({ where }),
            tx.lesson.count({ where }),
            tx.checkpoint.count({ where }),
        ]);
        if (items + dialogues + lessons + checkpoints > 0) {
            throw new ConflictException(
                `unit ${slug} still has content; archive its lessons, items, dialogues and checkpoint first`,
            );
        }
    }

    private async setStatus(
        tx: Tx,
        kind: AdminKind,
        id: string,
        status: ContentStatus,
        updatedBy: string,
    ): Promise<void> {
        const data = { status, updatedBy };
        switch (kind) {
            case 'unit':
                await tx.unit.update({ where: { id }, data });
                return;
            case 'item':
                await tx.learnItem.update({ where: { id }, data });
                return;
            case 'dialogue':
                await tx.dialogue.update({ where: { id }, data });
                return;
            case 'lesson':
                await tx.lesson.update({ where: { id }, data });
                return;
            case 'checkpoint':
                await tx.checkpoint.update({ where: { id }, data });
                return;
            case 'placement':
                await tx.placementTest.update({ where: { id }, data });
                return;
        }
    }

    private async requireRow(
        tx: Tx,
        kind: AdminKind,
        slug: string,
    ): Promise<RowMeta> {
        const row = await this.row(tx, kind, slug);
        if (!row) throw new NotFoundException(`${kind} ${slug} not found`);
        return row;
    }

    private async row(
        tx: Tx,
        kind: AdminKind,
        slug: string,
    ): Promise<RowMeta | null> {
        const where = { slug };
        switch (kind) {
            case 'unit':
                return tx.unit.findUnique({ where });
            case 'item':
                return tx.learnItem.findUnique({ where });
            case 'dialogue':
                return tx.dialogue.findUnique({ where });
            case 'lesson':
                return tx.lesson.findUnique({ where });
            case 'checkpoint':
                return tx.checkpoint.findUnique({ where });
            case 'placement':
                return tx.placementTest.findUnique({ where });
        }
    }

    private async read(
        tx: Tx,
        kind: AdminKind,
        slug: string,
    ): Promise<AdminRecord> {
        const unitSlug = async (unitId: string | null) =>
            unitId
                ? ((
                      await tx.unit.findUnique({
                          where: { id: unitId },
                          select: { slug: true },
                      })
                  )?.slug ?? unitId)
                : null;

        let meta: RowMeta;
        let record: Record<string, unknown>;
        switch (kind) {
            case 'unit': {
                const row = await tx.unit.findUnique({
                    where: { slug },
                    include: { stage: { select: { slug: true } } },
                });
                if (!row) throw new NotFoundException(`unit ${slug} not found`);
                meta = row;
                record = unitRowToRecord(row, row.stage.slug);
                break;
            }
            case 'item': {
                const row = await tx.learnItem.findUnique({ where: { slug } });
                if (!row) throw new NotFoundException(`item ${slug} not found`);
                meta = row;
                record = {
                    ...itemRowToSeed(row),
                    unit: await unitSlug(row.unitId),
                };
                break;
            }
            case 'dialogue': {
                const row = await tx.dialogue.findUnique({ where: { slug } });
                if (!row)
                    throw new NotFoundException(`dialogue ${slug} not found`);
                meta = row;
                record = {
                    ...dialogueRowToSeed(row),
                    unit: await unitSlug(row.unitId),
                };
                break;
            }
            case 'lesson': {
                const row = await tx.lesson.findUnique({
                    where: { slug },
                    include: {
                        steps: true,
                        items: {
                            include: { item: { select: { slug: true } } },
                        },
                    },
                });
                if (!row)
                    throw new NotFoundException(`lesson ${slug} not found`);
                meta = row;
                const itemSlug = new Map(
                    row.items.map((link) => [link.itemId, link.item.slug]),
                );
                record = {
                    ...lessonRowToSeed(row, itemSlug),
                    unit: await unitSlug(row.unitId),
                    order: row.order,
                };
                break;
            }
            case 'checkpoint': {
                const row = await tx.checkpoint.findUnique({ where: { slug } });
                if (!row)
                    throw new NotFoundException(`checkpoint ${slug} not found`);
                meta = row;
                record = {
                    ...checkpointRowToSeed(row),
                    unit: await unitSlug(row.unitId),
                };
                break;
            }
            case 'placement': {
                const row = await tx.placementTest.findUnique({
                    where: { slug },
                });
                if (!row)
                    throw new NotFoundException(`placement ${slug} not found`);
                meta = row;
                record = placementRowToSeed(row);
                break;
            }
        }
        return {
            kind,
            id: meta.id,
            slug: meta.slug,
            status: meta.status as ContentStatus,
            origin: rowOrigin(meta),
            updatedAt: meta.updatedAt,
            updatedBy: meta.updatedBy,
            record,
        };
    }
}
