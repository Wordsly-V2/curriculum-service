import type { TreeSnapshot } from '@/release/release.logic';

export const DEFAULT_RANGE_DAYS = 30;
export const MAX_RANGE_DAYS = 365;
export const MAX_LOOKUP_IDS = 100;

export interface DateRange {
    /** Inclusive UTC day, `YYYY-MM-DD`. */
    from: string;
    /** Inclusive UTC day, `YYYY-MM-DD`. */
    to: string;
}

/**
 * Fill in a missing end (today) and start (`DEFAULT_RANGE_DAYS` back), and
 * refuse ranges that are backwards or longer than `MAX_RANGE_DAYS`. Returns the
 * refusal as a string so the caller picks the exception.
 */
export function resolveRange(
    from: string | undefined,
    to: string | undefined,
    today: string = new Date().toISOString().slice(0, 10),
): DateRange | string {
    const end = to ?? today;
    const start = from ?? addDaysUtc(end, -(DEFAULT_RANGE_DAYS - 1));
    const span = daysBetween(start, end) + 1;
    if (span < 1) return '`from` must not be after `to`';
    if (span > MAX_RANGE_DAYS) {
        return `The range may span at most ${MAX_RANGE_DAYS} days`;
    }
    return { from: start, to: end };
}

/** One point per day of the range, zero where the rows have nothing. */
export function fillDailyCounts(
    range: DateRange,
    rows: readonly { date: string; count: number }[],
): { date: string; count: number }[] {
    const byDate = new Map(rows.map((row) => [row.date, row.count]));
    const series: { date: string; count: number }[] = [];
    for (let day = range.from; day <= range.to; day = addDaysUtc(day, 1)) {
        series.push({ date: day, count: byDate.get(day) ?? 0 });
    }
    return series;
}

/** A lesson with where it sits in the path, in learning order. */
export interface PathLesson {
    lessonId: string;
    title: string;
    unitId: string;
    unitTitle: string;
    stageId: string;
    cefr: string;
    /** 1-based position in the whole path. */
    position: number;
}

/** Every lesson of a release's tree, in the order a learner meets them. */
export function flattenLessons(tree: TreeSnapshot): PathLesson[] {
    const lessons: PathLesson[] = [];
    for (const stage of sorted(tree.stages)) {
        for (const unit of sorted(stage.units)) {
            for (const lesson of sorted(unit.lessons)) {
                lessons.push({
                    lessonId: lesson.id,
                    title: lesson.title,
                    unitId: unit.id,
                    unitTitle: unit.title,
                    stageId: stage.id,
                    cefr: stage.cefr,
                    position: lessons.length + 1,
                });
            }
        }
    }
    return lessons;
}

/**
 * The stage a learner has reached: the stage of the furthest lesson they have
 * completed in the active release, else the stage of the unit they started
 * from (placement or the first unit), else `null` (the start unit is no longer
 * in the release).
 */
export function reachedStage(
    tree: TreeSnapshot,
    lessons: readonly PathLesson[],
    completedLessonIds: ReadonlySet<string>,
    startUnitId: string | null,
): string | null {
    let furthest: PathLesson | undefined;
    for (const lesson of lessons) {
        if (completedLessonIds.has(lesson.lessonId)) furthest = lesson;
    }
    if (furthest) return furthest.stageId;

    const first = sorted(tree.stages)[0]?.id ?? null;
    if (!startUnitId) return first;
    const stage = tree.stages.find((s) =>
        s.units.some((unit) => unit.id === startUnitId),
    );
    return stage?.id ?? null;
}

/** Stage id for each unit in the tree. */
export function stageByUnit(tree: TreeSnapshot): Map<string, string> {
    const map = new Map<string, string>();
    for (const stage of tree.stages) {
        for (const unit of stage.units) map.set(unit.id, stage.id);
    }
    return map;
}

function sorted<T extends { order: number }>(rows: readonly T[]): T[] {
    return [...rows].sort((a, b) => a.order - b.order);
}

/** `YYYY-MM-DD` plus `days`, on the UTC calendar. */
export function addDaysUtc(date: string, days: number): string {
    return new Date(Date.parse(`${date}T00:00:00.000Z`) + days * 86_400_000)
        .toISOString()
        .slice(0, 10);
}

function daysBetween(from: string, to: string): number {
    return Math.round(
        (Date.parse(`${to}T00:00:00.000Z`) -
            Date.parse(`${from}T00:00:00.000Z`)) /
            86_400_000,
    );
}
