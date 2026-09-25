import type {
    TreeSnapshot,
    TreeStage,
    TreeUnit,
} from '@/release/release.logic';

/**
 * Unlocking on the path, computed from the release tree and what the learner
 * has done. Pure; the service feeds it rows and caches the result.
 *
 * - Nothing is open before enrolling.
 * - The start unit (placement's, else the first) and every unit before it are
 *   open, and units before it count as cleared.
 * - A unit is cleared when its checkpoint is passed, when it has no checkpoint
 *   and all its lessons are done, or when placement skipped it. The unit after
 *   a cleared unit opens.
 * - In an open unit the first lesson is available and each completed lesson
 *   opens the next; a cleared unit has every lesson available (a lesson added
 *   by a later release must not re-lock a unit the learner finished).
 * - A checkpoint becomes available once all lessons of its unit are done.
 * - Completed lessons stay completed even if the tree moved around them.
 */

export type NodeState = 'locked' | 'available' | 'completed';

export interface LearnerProgress {
    enrolled: boolean;
    /** Unit to start from (placement); null = the first unit. */
    startUnitId: string | null;
    completedLessonIds: ReadonlySet<string>;
    passedCheckpointIds: ReadonlySet<string>;
    /** Units placement let the learner skip. */
    skippedUnitIds: ReadonlySet<string>;
}

export interface LessonProgress {
    lessonId: string;
    state: NodeState;
}

export interface UnitProgress {
    unitId: string;
    state: NodeState;
    lessons: LessonProgress[];
    checkpoint: { checkpointId: string; state: NodeState } | null;
}

export interface PathProgress {
    units: UnitProgress[];
    /** Next lesson to take ("continue"), or null when there is none. */
    currentLessonId: string | null;
    completedLessonCount: number;
    totalLessonCount: number;
}

/** Units of the tree in learning order (the tree is stored sorted). */
export function unitsInOrder(tree: TreeSnapshot): TreeUnit[] {
    return tree.stages.flatMap((stage) => stage.units);
}

export function findUnit(
    tree: TreeSnapshot,
    unitId: string,
): { stage: TreeStage; unit: TreeUnit } | null {
    for (const stage of tree.stages) {
        const unit = stage.units.find((u) => u.id === unitId);
        if (unit) return { stage, unit };
    }
    return null;
}

export function findLessonUnit(
    tree: TreeSnapshot,
    lessonId: string,
): TreeUnit | null {
    return (
        unitsInOrder(tree).find((unit) =>
            unit.lessons.some((lesson) => lesson.id === lessonId),
        ) ?? null
    );
}

export function computeProgress(
    tree: TreeSnapshot,
    learner: LearnerProgress,
): PathProgress {
    const units = unitsInOrder(tree);
    const startIndex = Math.max(
        0,
        units.findIndex((u) => u.id === learner.startUnitId),
    );

    let previousCleared = true;
    let currentLessonId: string | null = null;
    let completedLessonCount = 0;
    let totalLessonCount = 0;

    const unitProgress = units.map((unit, index): UnitProgress => {
        const allDone = unit.lessons.every((l) =>
            learner.completedLessonIds.has(l.id),
        );
        const passed =
            unit.checkpointId !== null &&
            learner.passedCheckpointIds.has(unit.checkpointId);
        const cleared =
            learner.enrolled &&
            (index < startIndex ||
                learner.skippedUnitIds.has(unit.id) ||
                passed ||
                (unit.checkpointId === null && allDone));
        const open =
            learner.enrolled &&
            (index <= startIndex || previousCleared || cleared);

        let previousDone = true;
        const lessons = unit.lessons.map((lesson): LessonProgress => {
            const done = learner.completedLessonIds.has(lesson.id);
            const state: NodeState = done
                ? 'completed'
                : open && (cleared || previousDone)
                  ? 'available'
                  : 'locked';
            previousDone = done;
            if (state === 'available' && currentLessonId === null) {
                currentLessonId = lesson.id;
            }
            return { lessonId: lesson.id, state };
        });
        completedLessonCount += lessons.filter(
            (l) => l.state === 'completed',
        ).length;
        totalLessonCount += lessons.length;

        const checkpoint = unit.checkpointId && {
            checkpointId: unit.checkpointId,
            state: (passed
                ? 'completed'
                : open && (allDone || cleared)
                  ? 'available'
                  : 'locked') as NodeState,
        };

        previousCleared = cleared;
        return {
            unitId: unit.id,
            state: cleared ? 'completed' : open ? 'available' : 'locked',
            lessons,
            checkpoint: checkpoint || null,
        };
    });

    return {
        units: unitProgress,
        currentLessonId,
        completedLessonCount,
        totalLessonCount,
    };
}
