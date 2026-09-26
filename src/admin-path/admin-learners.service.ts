import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CacheService } from '@/cache/cache.service';
import { PrismaService } from '@/prisma/prisma.service';
import type { TreeSnapshot } from '@/release/release.logic';
import { ReleaseService } from '@/release/release.service';
import {
    addDaysUtc,
    fillDailyCounts,
    flattenLessons,
    reachedStage,
    resolveRange,
    stageByUnit,
} from './admin-learners.logic';

export interface PathStats {
    from: string;
    to: string;
    /** The release the funnel and stages are measured against. */
    release: { id: string; version: number } | null;
    enrollments: {
        total: number;
        newInRange: number;
        perDay: { date: string; count: number }[];
    };
    /** First completions of a lesson, per UTC day. */
    completionsPerDay: { date: string; count: number }[];
    /** Where enrolled learners have got to (see `reachedStage`). */
    stages: {
        stageId: string;
        cefr: string;
        title: string;
        learners: number;
    }[];
    /** Learners who have completed each lesson, in path order. */
    funnel: {
        lessonId: string;
        position: number;
        title: string;
        unitTitle: string;
        cefr: string;
        learners: number;
    }[];
    checkpoints: {
        unitId: string;
        unitTitle: string;
        attempts: number;
        passedAttempts: number;
        learners: number;
        passedLearners: number;
    }[];
    placement: {
        results: number;
        learners: number;
        /** Stage of the unit each learner's latest result placed them in. */
        byStage: { stageId: string; cefr: string; learners: number }[];
    };
}

export interface ItemLookup {
    id: string;
    slug: string;
    type: string;
    text: string;
    meaningVi: string;
    status: string;
    unitTitle: string | null;
}

export interface LearnerPath {
    userLoginId: string;
    enrollment: {
        enrolledAt: string;
        startUnit: { id: string; title: string } | null;
    } | null;
    progress: {
        lessonsDone: number;
        /** Lessons in the active release. */
        lessonsTotal: number;
        stage: { id: string; cefr: string; title: string } | null;
    };
    completions: {
        lessonId: string;
        title: string;
        unitTitle: string | null;
        timesCompleted: number;
        bestScore: number | null;
        firstCompletedAt: string;
        lastCompletedAt: string;
    }[];
    checkpointAttempts: {
        unitTitle: string | null;
        scorePercent: number;
        passed: boolean;
        createdAt: string;
    }[];
    placements: {
        scorePercent: number;
        placedUnitTitle: string | null;
        createdAt: string;
    }[];
}

/** Recent rows shown per learner; the counts above them are complete. */
const RECENT_LIMIT = 50;

/**
 * Cross-learner Wordsly Path figures and per-learner support behind
 * `/admin/path/stats` and `/admin/path/users/:id`. Structure (stages, the order
 * of lessons) comes from the active release's tree, so the funnel matches what
 * learners actually see; titles for rows outside it fall back to the working
 * copy, archived rows included.
 */
@Injectable()
export class AdminLearnersService {
    private readonly logger = new Logger(AdminLearnersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly releases: ReleaseService,
        private readonly cache: CacheService,
    ) {}

    async stats(from?: string, to?: string): Promise<PathStats> {
        const range = resolveRange(from, to);
        if (typeof range === 'string') throw new BadRequestException(range);
        const start = new Date(`${range.from}T00:00:00.000Z`);
        const endExclusive = new Date(
            `${addDaysUtc(range.to, 1)}T00:00:00.000Z`,
        );

        const release = await this.releases.activeRelease();
        const tree = release ? await this.tree(release.id) : null;
        const lessons = tree ? flattenLessons(tree) : [];
        const lessonIds = lessons.map((lesson) => lesson.lessonId);

        const [
            enrollmentTotal,
            enrolledPerDay,
            completedPerDay,
            perLesson,
            furthest,
            enrollments,
            checkpointRows,
            placementRows,
        ] = await Promise.all([
            this.prisma.enrollment.count(),
            this.prisma.$queryRaw<{ date: string; count: number }[]>`
                SELECT to_char(enrolled_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
                       count(*)::int AS count
                FROM enrollments
                WHERE enrolled_at >= ${start} AND enrolled_at < ${endExclusive}
                GROUP BY 1`,
            this.prisma.$queryRaw<{ date: string; count: number }[]>`
                SELECT to_char(first_completed_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
                       count(*)::int AS count
                FROM lesson_completions
                WHERE first_completed_at >= ${start} AND first_completed_at < ${endExclusive}
                GROUP BY 1`,
            this.prisma.$queryRaw<{ lessonId: string; learners: number }[]>`
                SELECT lesson_id::text AS "lessonId",
                       count(DISTINCT user_login_id)::int AS learners
                FROM lesson_completions
                WHERE lesson_id = ANY(${lessonIds}::uuid[])
                GROUP BY lesson_id`,
            this.prisma.$queryRaw<{ userLoginId: string; position: number }[]>`
                SELECT c.user_login_id::text AS "userLoginId",
                       max(p.position)::int AS position
                FROM lesson_completions c
                JOIN unnest(${lessonIds}::uuid[]) WITH ORDINALITY AS p(lesson_id, position)
                  ON p.lesson_id = c.lesson_id
                GROUP BY c.user_login_id`,
            this.prisma.enrollment.findMany({
                select: { userLoginId: true, startUnitId: true },
            }),
            this.prisma.$queryRaw<
                {
                    unitId: string;
                    attempts: number;
                    passedAttempts: number;
                    learners: number;
                    passedLearners: number;
                }[]
            >`
                SELECT ch.unit_id::text AS "unitId",
                       count(*)::int AS attempts,
                       count(*) FILTER (WHERE a.passed)::int AS "passedAttempts",
                       count(DISTINCT a.user_login_id)::int AS learners,
                       count(DISTINCT a.user_login_id) FILTER (WHERE a.passed)::int AS "passedLearners"
                FROM checkpoint_attempts a
                JOIN checkpoints ch ON ch.id = a.checkpoint_id
                GROUP BY ch.unit_id`,
            // Each learner's latest result: the one that set where they start.
            this.prisma.$queryRaw<{ placedUnitId: string | null }[]>`
                SELECT DISTINCT ON (user_login_id) placed_unit_id::text AS "placedUnitId"
                FROM placement_results
                ORDER BY user_login_id, created_at DESC`,
        ]);

        const placementTotals = await this.prisma.placementResult.count();

        // Stage each enrolled learner has reached.
        const byPosition = new Map(lessons.map((l) => [l.position, l]));
        const furthestBy = new Map(
            furthest.map((row) => [row.userLoginId, row.position]),
        );
        const stageCounts = new Map<string, number>();
        if (tree) {
            for (const enrollment of enrollments) {
                const position = furthestBy.get(enrollment.userLoginId);
                const stageId = position
                    ? (byPosition.get(position)?.stageId ?? null)
                    : reachedStage(
                          tree,
                          lessons,
                          new Set(),
                          enrollment.startUnitId,
                      );
                if (stageId) {
                    stageCounts.set(
                        stageId,
                        (stageCounts.get(stageId) ?? 0) + 1,
                    );
                }
            }
        }

        const unitStage = tree ? stageByUnit(tree) : new Map<string, string>();
        const placedCounts = new Map<string, number>();
        for (const row of placementRows) {
            // No placed unit = start at the beginning.
            const stageId = row.placedUnitId
                ? unitStage.get(row.placedUnitId)
                : [...(tree?.stages ?? [])].sort((a, b) => a.order - b.order)[0]
                      ?.id;
            if (stageId) {
                placedCounts.set(stageId, (placedCounts.get(stageId) ?? 0) + 1);
            }
        }

        const learnersBy = new Map(
            perLesson.map((r) => [r.lessonId, r.learners]),
        );
        const unitTitles = await this.unitTitles(
            checkpointRows.map((row) => row.unitId),
            tree,
        );
        const stages = [...(tree?.stages ?? [])].sort(
            (a, b) => a.order - b.order,
        );
        const enrolledSeries = fillDailyCounts(range, enrolledPerDay);

        return {
            ...range,
            release,
            enrollments: {
                total: enrollmentTotal,
                newInRange: enrolledSeries.reduce((sum, d) => sum + d.count, 0),
                perDay: enrolledSeries,
            },
            completionsPerDay: fillDailyCounts(range, completedPerDay),
            stages: stages.map((stage) => ({
                stageId: stage.id,
                cefr: stage.cefr,
                title: stage.title,
                learners: stageCounts.get(stage.id) ?? 0,
            })),
            funnel: lessons.map((lesson) => ({
                lessonId: lesson.lessonId,
                position: lesson.position,
                title: lesson.title,
                unitTitle: lesson.unitTitle,
                cefr: lesson.cefr,
                learners: learnersBy.get(lesson.lessonId) ?? 0,
            })),
            checkpoints: checkpointRows
                .map((row) => ({
                    ...row,
                    unitTitle: unitTitles.get(row.unitId) ?? 'Unknown unit',
                }))
                .sort(
                    (a, b) =>
                        this.unitOrder(tree, a.unitId) -
                        this.unitOrder(tree, b.unitId),
                ),
            placement: {
                results: placementTotals,
                learners: placementRows.length,
                byStage: stages.map((stage) => ({
                    stageId: stage.id,
                    cefr: stage.cefr,
                    learners: placedCounts.get(stage.id) ?? 0,
                })),
            },
        };
    }

    /** Working-copy details for item ids (archived ones too), e.g. the hardest items. */
    async lookupItems(ids: string[]): Promise<ItemLookup[]> {
        const rows = await this.prisma.learnItem.findMany({
            where: { id: { in: [...new Set(ids)] } },
            select: {
                id: true,
                slug: true,
                type: true,
                text: true,
                meaningVi: true,
                status: true,
                unit: { select: { title: true } },
            },
        });
        return rows.map(({ unit, ...item }) => ({
            ...item,
            unitTitle: unit?.title ?? null,
        }));
    }

    async learner(userLoginId: string): Promise<LearnerPath> {
        const release = await this.releases.activeRelease();
        const tree = release ? await this.tree(release.id) : null;
        const lessons = tree ? flattenLessons(tree) : [];

        const [enrollment, completions, attempts, placements] =
            await Promise.all([
                this.prisma.enrollment.findUnique({ where: { userLoginId } }),
                this.prisma.lessonCompletion.findMany({
                    where: { userLoginId },
                    orderBy: { firstCompletedAt: 'desc' },
                }),
                this.prisma.checkpointAttempt.findMany({
                    where: { userLoginId },
                    orderBy: { createdAt: 'desc' },
                    take: RECENT_LIMIT,
                    select: {
                        scorePercent: true,
                        passed: true,
                        createdAt: true,
                        checkpoint: { select: { unitId: true } },
                    },
                }),
                this.prisma.placementResult.findMany({
                    where: { userLoginId },
                    orderBy: { createdAt: 'desc' },
                    take: RECENT_LIMIT,
                    select: {
                        scorePercent: true,
                        placedUnitId: true,
                        createdAt: true,
                    },
                }),
            ]);

        const lessonTitles = await this.lessonTitles(
            completions.map((c) => c.lessonId),
        );
        const unitTitles = await this.unitTitles(
            [
                ...(enrollment?.startUnitId ? [enrollment.startUnitId] : []),
                ...attempts.map((a) => a.checkpoint.unitId),
                ...placements.flatMap((p) =>
                    p.placedUnitId ? [p.placedUnitId] : [],
                ),
                ...[...lessonTitles.values()].map((l) => l.unitId),
            ],
            tree,
        );

        const completedIds = new Set(completions.map((c) => c.lessonId));
        const stageId =
            tree && enrollment
                ? reachedStage(
                      tree,
                      lessons,
                      completedIds,
                      enrollment.startUnitId,
                  )
                : null;
        const stage = tree?.stages.find((s) => s.id === stageId);

        return {
            userLoginId,
            enrollment: enrollment
                ? {
                      enrolledAt: enrollment.enrolledAt.toISOString(),
                      startUnit: enrollment.startUnitId
                          ? {
                                id: enrollment.startUnitId,
                                title:
                                    unitTitles.get(enrollment.startUnitId) ??
                                    'Unknown unit',
                            }
                          : null,
                  }
                : null,
            progress: {
                lessonsDone: lessons.filter((l) => completedIds.has(l.lessonId))
                    .length,
                lessonsTotal: lessons.length,
                stage: stage
                    ? { id: stage.id, cefr: stage.cefr, title: stage.title }
                    : null,
            },
            completions: completions.map((c) => {
                const lesson = lessonTitles.get(c.lessonId);
                return {
                    lessonId: c.lessonId,
                    title: lesson?.title ?? 'Unknown lesson',
                    unitTitle: lesson
                        ? (unitTitles.get(lesson.unitId) ?? null)
                        : null,
                    timesCompleted: c.timesCompleted,
                    bestScore: c.bestScore,
                    firstCompletedAt: c.firstCompletedAt.toISOString(),
                    lastCompletedAt: c.lastCompletedAt.toISOString(),
                };
            }),
            checkpointAttempts: attempts.map((a) => ({
                unitTitle: unitTitles.get(a.checkpoint.unitId) ?? null,
                scorePercent: a.scorePercent,
                passed: a.passed,
                createdAt: a.createdAt.toISOString(),
            })),
            placements: placements.map((p) => ({
                scorePercent: p.scorePercent,
                placedUnitTitle: p.placedUnitId
                    ? (unitTitles.get(p.placedUnitId) ?? null)
                    : null,
                createdAt: p.createdAt.toISOString(),
            })),
        };
    }

    /**
     * Take a learner back to before they enrolled: enrollment, lesson
     * completions, checkpoint attempts and placement results go. Their Path
     * cards live in learning-service (`/admin/learning/users/:id/reset` with
     * `{scope: 'cards', source: 'path'}`).
     */
    async reset(
        actorId: string,
        userLoginId: string,
    ): Promise<{ affected: Record<string, number> }> {
        const affected = await this.prisma.$transaction(async (tx) => {
            const where = { userLoginId };
            return {
                enrollment: (await tx.enrollment.deleteMany({ where })).count,
                lessonCompletion: (
                    await tx.lessonCompletion.deleteMany({ where })
                ).count,
                checkpointAttempt: (
                    await tx.checkpointAttempt.deleteMany({ where })
                ).count,
                placementResult: (
                    await tx.placementResult.deleteMany({ where })
                ).count,
            };
        });
        await this.cache.invalidateUser(userLoginId);
        this.logger.log(
            `admin_action ${JSON.stringify({ actor: actorId, action: 'reset_path', target: userLoginId, affected })}`,
        );
        return { affected };
    }

    private async tree(releaseId: string): Promise<TreeSnapshot | null> {
        const row = await this.prisma.publishedTree.findUnique({
            where: { releaseId },
        });
        return (row?.tree as TreeSnapshot | undefined) ?? null;
    }

    /** Titles from the release tree, else the working copy (archived included). */
    private async unitTitles(
        unitIds: string[],
        tree: TreeSnapshot | null,
    ): Promise<Map<string, string>> {
        const titles = new Map<string, string>();
        for (const stage of tree?.stages ?? []) {
            for (const unit of stage.units) titles.set(unit.id, unit.title);
        }
        const missing = [...new Set(unitIds)].filter((id) => !titles.has(id));
        if (missing.length > 0) {
            const rows = await this.prisma.unit.findMany({
                where: { id: { in: missing } },
                select: { id: true, title: true },
            });
            for (const row of rows) titles.set(row.id, row.title);
        }
        return titles;
    }

    private async lessonTitles(
        lessonIds: string[],
    ): Promise<Map<string, { title: string; unitId: string }>> {
        const rows = await this.prisma.lesson.findMany({
            where: { id: { in: [...new Set(lessonIds)] } },
            select: { id: true, title: true, unitId: true },
        });
        return new Map(
            rows.map((row) => [
                row.id,
                { title: row.title, unitId: row.unitId },
            ]),
        );
    }

    private unitOrder(tree: TreeSnapshot | null, unitId: string): number {
        let index = 0;
        for (const stage of [...(tree?.stages ?? [])].sort(
            (a, b) => a.order - b.order,
        )) {
            for (const unit of [...stage.units].sort(
                (a, b) => a.order - b.order,
            )) {
                if (unit.id === unitId) return index;
                index += 1;
            }
        }
        return Number.MAX_SAFE_INTEGER;
    }
}
