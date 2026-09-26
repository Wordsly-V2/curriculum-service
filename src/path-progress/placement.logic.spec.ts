import type { PlacementQuestionView } from '@/release/release.logic';
import {
    gradePlacement,
    laterStart,
    placementLearnerQuestions,
    type PlacementResponse,
} from './placement.logic';

const UNITS = ['u1', 'u2', 'u3', 'u4', 'u5'];

/** Two choice questions per unit (answer 0), in path order. */
function questionsFor(unitIds: string[], perUnit = 2): PlacementQuestionView[] {
    return unitIds.flatMap((unitId) =>
        Array.from({ length: perUnit }, (_, i) => ({
            kind: 'choice' as const,
            prompt: `${unitId}#${i}`,
            options: ['right', 'wrong', 'other'],
            answer: 0,
            unitId,
        })),
    );
}

const right = 0;
const wrong = 1;

describe('placementLearnerQuestions', () => {
    it('strips answers and keeps the probed unit', () => {
        const [q] = placementLearnerQuestions(questionsFor(['u2'], 1));
        expect(q).toEqual({
            kind: 'choice',
            prompt: 'u2#0',
            options: ['right', 'wrong', 'other'],
            unitId: 'u2',
        });
    });
});

describe('gradePlacement', () => {
    const questions = questionsFor(['u1', 'u2', 'u3', 'u4']);

    it('starts at the first unit when the first probed unit is missed', () => {
        const grade = gradePlacement(
            questions,
            questions.map(() => wrong),
            UNITS,
        );
        expect(grade.placedUnitId).toBeNull();
        expect(grade.skippedUnitIds).toEqual([]);
        expect(grade.scorePercent).toBe(0);
    });

    it('places right after the last known unit', () => {
        // u1, u2 right; u3 both wrong; u4 right (not reached)
        const responses = [
            right,
            right,
            right,
            right,
            wrong,
            wrong,
            right,
            right,
        ];
        const grade = gradePlacement(questions, responses, UNITS);
        expect(grade.placedUnitId).toBe('u3');
        expect(grade.skippedUnitIds).toEqual(['u1', 'u2']);
        expect(grade.units.map((u) => u.known)).toEqual([
            true,
            true,
            false,
            false,
        ]);
    });

    it('forgives one slip in a unit while the running score holds', () => {
        const responses = [
            right,
            right,
            right,
            wrong,
            right,
            right,
            wrong,
            wrong,
        ];
        expect(gradePlacement(questions, responses, UNITS).placedUnitId).toBe(
            'u4',
        );
    });

    it('stops when the running score falls under the bar', () => {
        // Half of every unit: each unit passes alone, the running 50% does not.
        const responses = questions.map((_, i) =>
            i % 2 === 0 ? right : wrong,
        );
        expect(gradePlacement(questions, responses, UNITS).placedUnitId).toBe(
            null,
        );
    });

    it('treats unanswered questions (stopped early) as wrong', () => {
        const responses: PlacementResponse[] = [right, right, right, right];
        const grade = gradePlacement(
            questions,
            [...responses, null, null, null, null],
            UNITS,
        );
        expect(grade.placedUnitId).toBe('u3');
        expect(grade.scorePercent).toBe(50);
    });

    it('carries past an unprobed unit when a later unit is known', () => {
        const sparse = questionsFor(['u1', 'u3']);
        const grade = gradePlacement(
            sparse,
            sparse.map(() => right),
            UNITS,
        );
        expect(grade.placedUnitId).toBe('u4');
        expect(grade.skippedUnitIds).toEqual(['u1', 'u2', 'u3']);
    });

    it('never skips the whole path', () => {
        const all = questionsFor(UNITS);
        const grade = gradePlacement(
            all,
            all.map(() => right),
            UNITS,
        );
        expect(grade.placedUnitId).toBe('u5');
        expect(grade.skippedUnitIds).toEqual(['u1', 'u2', 'u3', 'u4']);
    });

    it('ignores questions probing a unit the release no longer has', () => {
        const qs = questionsFor(['u1', 'gone']);
        const grade = gradePlacement(
            qs,
            qs.map(() => right),
            UNITS,
        );
        expect(grade.units.map((u) => u.unitId)).toEqual(['u1']);
        expect(grade.placedUnitId).toBe('u2');
    });
});

describe('laterStart', () => {
    it('moves forward only', () => {
        expect(laterStart(UNITS, null, 'u3')).toBe('u3');
        expect(laterStart(UNITS, 'u3', 'u2')).toBe('u3');
        expect(laterStart(UNITS, 'u3', null)).toBe('u3');
        expect(laterStart(UNITS, 'u2', 'u4')).toBe('u4');
    });

    it('takes the placement when the current start left the release', () => {
        expect(laterStart(UNITS, 'gone', 'u2')).toBe('u2');
    });
});
