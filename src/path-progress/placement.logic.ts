import type { PlacementQuestionView } from '@/release/release.logic';
import {
    type CheckpointQuestion,
    type CheckpointResponse,
    isCorrect,
    learnerQuestions,
} from './checkpoint.logic';

/**
 * Placement: one test for the whole path, graded here. Each question probes a
 * unit, and the questions come in path order. Grading walks the probed units
 * in path order and stops at the first one the learner does not know; the
 * learner starts right after the last unit they know, and every unit before
 * that start counts as cleared (unit.logic.ts).
 *
 * A unit is known when the learner got at least UNIT_PERCENT of its own
 * questions and at least RUNNING_PERCENT of all questions so far. The second
 * rule stops lucky guesses from carrying a learner far: guessing three-option
 * questions averages 33%, well under it.
 *
 * Unanswered questions (null: the learner stopped early, "I don't know the
 * rest") are wrong, so stopping places the learner where they stopped.
 */

export const PLACEMENT_UNIT_PERCENT = 50;
export const PLACEMENT_RUNNING_PERCENT = 75;

/** A question as the learner sees it, with the unit it probes. */
export type PlacementLearnerQuestion = CheckpointQuestion & { unitId: string };

/** null = not answered. */
export type PlacementResponse = CheckpointResponse | null;

export interface PlacementUnitResult {
    unitId: string;
    correct: number;
    total: number;
    /** Part of the known prefix; false from the first unit the learner missed. */
    known: boolean;
}

export interface PlacementGrade {
    scorePercent: number;
    /** Where the test puts the learner; null = the first unit. */
    placedUnitId: string | null;
    /** Units before the placed one, in path order. */
    skippedUnitIds: string[];
    /** Probed units in path order. */
    units: PlacementUnitResult[];
}

export function placementLearnerQuestions(
    questions: PlacementQuestionView[],
): PlacementLearnerQuestion[] {
    const views = learnerQuestions(questions);
    return views.map((view, i) => ({ ...view, unitId: questions[i].unitId }));
}

/**
 * Grades an attempt. `unitOrder` is every unit id of the release in path
 * order; questions probing a unit outside it are ignored.
 */
export function gradePlacement(
    questions: PlacementQuestionView[],
    responses: readonly PlacementResponse[],
    unitOrder: readonly string[],
): PlacementGrade {
    const verdicts = questions.map(
        (q, i) => responses[i] != null && isCorrect(q, responses[i]),
    );
    const total = verdicts.length;
    const scorePercent =
        total === 0
            ? 0
            : Math.round((verdicts.filter(Boolean).length * 100) / total);

    const tally = new Map<string, { correct: number; total: number }>();
    questions.forEach((q, i) => {
        const t = tally.get(q.unitId) ?? { correct: 0, total: 0 };
        t.total += 1;
        if (verdicts[i]) t.correct += 1;
        tally.set(q.unitId, t);
    });

    let lastKnown = -1;
    let stillKnown = true;
    let runningCorrect = 0;
    let runningTotal = 0;
    const units: PlacementUnitResult[] = [];
    unitOrder.forEach((unitId, index) => {
        const t = tally.get(unitId);
        if (!t) return;
        runningCorrect += t.correct;
        runningTotal += t.total;
        stillKnown =
            stillKnown &&
            t.correct * 100 >= t.total * PLACEMENT_UNIT_PERCENT &&
            runningCorrect * 100 >= runningTotal * PLACEMENT_RUNNING_PERCENT;
        if (stillKnown) lastKnown = index;
        units.push({ unitId, ...t, known: stillKnown });
    });

    // Knowing the last unit still leaves it to take: the path is never skipped whole.
    const placedIndex = Math.min(lastKnown + 1, unitOrder.length - 1);
    return {
        scorePercent,
        placedUnitId: placedIndex > 0 ? unitOrder[placedIndex] : null,
        skippedUnitIds: unitOrder.slice(0, Math.max(placedIndex, 0)),
        units,
    };
}

/**
 * The start unit after a placement: the later of the current start and the
 * placed unit. A retake never moves a learner back, so it never re-locks
 * what an earlier placement opened.
 */
export function laterStart(
    unitOrder: readonly string[],
    current: string | null,
    placed: string | null,
): string | null {
    const rank = (id: string | null) => (id ? unitOrder.indexOf(id) : -1);
    return rank(placed) > rank(current) ? placed : current;
}
