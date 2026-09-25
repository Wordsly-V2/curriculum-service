import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheKind } from '@/cache/cache-ttl';
import { CacheService } from '@/cache/cache.service';
import { PublishedContentService } from '@/path-content/published-content.service';
import { PrismaService } from '@/prisma/prisma.service';
import type {
    LessonSnapshot,
    TreeSnapshot,
    TreeUnit,
} from '@/release/release.logic';
import { type ReleaseInfo, ReleaseService } from '@/release/release.service';
import {
    type NodeState,
    type PathProgress,
    type UnitProgress,
    computeProgress,
    findLessonUnit,
    findUnit,
} from './unit.logic';

export interface PathMe {
    enrolled: boolean;
    enrolledAt: string | null;
    startUnitId: string | null;
    release: ReleaseInfo;
    progress: PathProgress;
}

export interface UnitView {
    stage: {
        id: string;
        slug: string;
        cefr: string;
        title: string;
        titleVi: string;
    };
    unit: TreeUnit;
    progress: UnitProgress;
}

export interface LessonView {
    lesson: LessonSnapshot;
    state: NodeState;
}

export interface CompleteResult {
    /** True when this clientRequestId was already recorded (offline retry). */
    replayed: boolean;
    me: PathMe;
}

/**
 * A learner's progress along the active release: enrolment, what is unlocked
 * (unit.logic.ts), and lesson completion. The learner's view is cached per
 * user and release, and dropped on every write.
 */
@Injectable()
export class PathProgressService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly releases: ReleaseService,
        private readonly published: PublishedContentService,
    ) {}

    async me(userLoginId: string): Promise<PathMe> {
        const { release, tree } = await this.active();
        return this.meFor(userLoginId, release, tree);
    }

    /** Idempotent. Placement (later) may set the start unit. */
    async enroll(userLoginId: string): Promise<PathMe> {
        await this.active();
        await this.prisma.enrollment.upsert({
            where: { userLoginId },
            create: { userLoginId },
            update: {},
        });
        await this.cache.invalidateUser(userLoginId);
        return this.me(userLoginId);
    }

    async unit(userLoginId: string, unitId: string): Promise<UnitView> {
        const { release, tree } = await this.active();
        const found = findUnit(tree, unitId);
        if (!found) throw new NotFoundException('Unit not found');

        const me = await this.meFor(userLoginId, release, tree);
        const progress = me.progress.units.find((u) => u.unitId === unitId)!;
        if (progress.state === 'locked') {
            throw new ForbiddenException('This unit is still locked');
        }

        const { id, slug, cefr, title, titleVi } = found.stage;
        return {
            stage: { id, slug, cefr, title, titleVi },
            unit: found.unit,
            progress,
        };
    }

    async lesson(userLoginId: string, lessonId: string): Promise<LessonView> {
        const { release, tree } = await this.active();
        const state = await this.lessonState(
            userLoginId,
            lessonId,
            release,
            tree,
        );
        const lesson = await this.published.lesson(release.id, lessonId);
        if (!lesson) throw new NotFoundException('Lesson not found');
        return { lesson, state };
    }

    /**
     * Records a finished lesson. Replaying the same `clientRequestId` (an
     * offline queue retrying) changes nothing; only the latest id per lesson
     * is remembered, which is what a retry loop resends.
     */
    async complete(
        userLoginId: string,
        lessonId: string,
        input: { clientRequestId: string; scorePercent?: number },
    ): Promise<CompleteResult> {
        const { release, tree } = await this.active();
        await this.lessonState(userLoginId, lessonId, release, tree);

        const replayed = await this.recordCompletion(
            userLoginId,
            lessonId,
            release.id,
            input,
        );
        if (!replayed) await this.cache.invalidateUser(userLoginId);
        return { replayed, me: await this.meFor(userLoginId, release, tree) };
    }

    private async recordCompletion(
        userLoginId: string,
        lessonId: string,
        releaseId: string,
        input: { clientRequestId: string; scorePercent?: number },
        retried = false,
    ): Promise<boolean> {
        const where = { userLoginId_lessonId: { userLoginId, lessonId } };
        const existing = await this.prisma.lessonCompletion.findUnique({
            where,
        });
        if (existing?.lastClientRequestId === input.clientRequestId) {
            return true;
        }

        const score = input.scorePercent ?? null;
        if (existing) {
            const best =
                existing.bestScore === null || score === null
                    ? (existing.bestScore ?? score)
                    : Math.max(existing.bestScore, score);
            await this.prisma.lessonCompletion.update({
                where,
                data: {
                    timesCompleted: { increment: 1 },
                    bestScore: best,
                    lastClientRequestId: input.clientRequestId,
                    lastCompletedAt: new Date(),
                    releaseId,
                },
            });
            return false;
        }

        try {
            await this.prisma.lessonCompletion.create({
                data: {
                    userLoginId,
                    lessonId,
                    releaseId,
                    bestScore: score,
                    lastClientRequestId: input.clientRequestId,
                },
            });
            return false;
        } catch (err: unknown) {
            // A concurrent first completion won the insert: take the update path.
            if (
                !retried &&
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002'
            ) {
                return this.recordCompletion(
                    userLoginId,
                    lessonId,
                    releaseId,
                    input,
                    true,
                );
            }
            throw err;
        }
    }

    /** 404 for a lesson outside the release, 403 while it is locked. */
    private async lessonState(
        userLoginId: string,
        lessonId: string,
        release: ReleaseInfo,
        tree: TreeSnapshot,
    ): Promise<NodeState> {
        const unit = findLessonUnit(tree, lessonId);
        if (!unit) throw new NotFoundException('Lesson not found');

        const me = await this.meFor(userLoginId, release, tree);
        const state = me.progress.units
            .find((u) => u.unitId === unit.id)!
            .lessons.find((l) => l.lessonId === lessonId)!.state;
        if (state === 'locked') {
            throw new ForbiddenException('This lesson is still locked');
        }
        return state;
    }

    /** The active release, its tree and the learner's view of it. */
    async context(userLoginId: string): Promise<{
        release: ReleaseInfo;
        tree: TreeSnapshot;
        me: PathMe;
    }> {
        const { release, tree } = await this.active();
        return {
            release,
            tree,
            me: await this.meFor(userLoginId, release, tree),
        };
    }

    private async active(): Promise<{
        release: ReleaseInfo;
        tree: TreeSnapshot;
    }> {
        const release = await this.releases.activeRelease();
        const tree = release && (await this.published.tree(release.id));
        if (!release || !tree) {
            throw new NotFoundException('Wordsly Path is not published yet');
        }
        return { release, tree };
    }

    private meFor(
        userLoginId: string,
        release: ReleaseInfo,
        tree: TreeSnapshot,
    ): Promise<PathMe> {
        return this.cache.getOrSet(
            userLoginId,
            ['path', 'me', release.id],
            async () => {
                const [enrollment, completions, passed, placement] =
                    await Promise.all([
                        this.prisma.enrollment.findUnique({
                            where: { userLoginId },
                        }),
                        this.prisma.lessonCompletion.findMany({
                            where: { userLoginId },
                            select: { lessonId: true },
                        }),
                        this.prisma.checkpointAttempt.findMany({
                            where: { userLoginId, passed: true },
                            select: { checkpointId: true },
                            distinct: ['checkpointId'],
                        }),
                        this.prisma.placementResult.findFirst({
                            where: { userLoginId },
                            orderBy: { createdAt: 'desc' },
                            select: { skippedUnitIds: true },
                        }),
                    ]);

                const startUnitId = enrollment?.startUnitId ?? null;
                return {
                    enrolled: enrollment !== null,
                    enrolledAt: enrollment?.enrolledAt.toISOString() ?? null,
                    startUnitId,
                    release,
                    progress: computeProgress(tree, {
                        enrolled: enrollment !== null,
                        startUnitId,
                        completedLessonIds: new Set(
                            completions.map((c) => c.lessonId),
                        ),
                        passedCheckpointIds: new Set(
                            passed.map((p) => p.checkpointId),
                        ),
                        skippedUnitIds: new Set(placement?.skippedUnitIds),
                    }),
                };
            },
            CacheKind.LearnerState,
        );
    }
}
