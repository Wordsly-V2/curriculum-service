import type { TreeSnapshot, TreeUnit } from '@/release/release.logic';
import {
    type LearnerProgress,
    computeProgress,
    findLessonUnit,
    findUnit,
} from './unit.logic';

const unit = (id: string, lessons: number, checkpoint = true): TreeUnit => ({
    id,
    slug: id,
    order: 1,
    title: id,
    titleVi: id,
    canDo: [],
    checkpointId: checkpoint ? `${id}-cp` : null,
    lessons: Array.from({ length: lessons }, (_, i) => ({
        id: `${id}-l${i + 1}`,
        slug: `${id}-l${i + 1}`,
        order: i + 1,
        title: 'l',
        titleVi: 'l',
        estimatedMinutes: 10,
        newItemCount: 5,
    })),
});

// u1, u2 in stage s1; u3 (no checkpoint), u4 in stage s2.
const tree: TreeSnapshot = {
    snapshotVersion: 1,
    stages: [
        {
            id: 's1',
            slug: 's1',
            cefr: 'PRE_A1',
            order: 1,
            title: 's',
            titleVi: 's',
            units: [unit('u1', 2), unit('u2', 2)],
        },
        {
            id: 's2',
            slug: 's2',
            cefr: 'A1',
            order: 2,
            title: 's',
            titleVi: 's',
            units: [unit('u3', 2, false), unit('u4', 1)],
        },
    ],
};

const learner = (
    overrides: Partial<Omit<LearnerProgress, 'enrolled'>> & {
        enrolled?: boolean;
    } = {},
) => ({
    enrolled: true,
    startUnitId: null,
    completedLessonIds: new Set<string>(),
    passedCheckpointIds: new Set<string>(),
    skippedUnitIds: new Set<string>(),
    ...overrides,
});

/** Compact picture: "unit:state lesson,lesson cp" per unit. */
function picture(p: LearnerProgress) {
    const initial = (s: string) => s[0].toUpperCase(); // L(ocked) A(vailable) C(ompleted)
    return computeProgress(tree, p).units.map(
        (u) =>
            `${u.unitId}:${initial(u.state)} ${u.lessons.map((l) => initial(l.state)).join('')}` +
            (u.checkpoint ? ` ${initial(u.checkpoint.state)}` : ''),
    );
}

describe('computeProgress', () => {
    it('locks everything before enrolment', () => {
        expect(picture(learner({ enrolled: false }))).toEqual([
            'u1:L LL L',
            'u2:L LL L',
            'u3:L LL',
            'u4:L L L',
        ]);
        expect(
            computeProgress(tree, learner({ enrolled: false })).currentLessonId,
        ).toBeNull();
    });

    it('opens the first lesson of the first unit on enrolment', () => {
        const progress = computeProgress(tree, learner());
        expect(picture(learner())).toEqual([
            'u1:A AL L',
            'u2:L LL L',
            'u3:L LL',
            'u4:L L L',
        ]);
        expect(progress.currentLessonId).toBe('u1-l1');
        expect(progress).toMatchObject({
            completedLessonCount: 0,
            totalLessonCount: 7,
        });
    });

    it('opens lessons one by one, then the checkpoint', () => {
        expect(
            picture(learner({ completedLessonIds: new Set(['u1-l1']) }))[0],
        ).toBe('u1:A CA L');
        const done = learner({
            completedLessonIds: new Set(['u1-l1', 'u1-l2']),
        });
        expect(picture(done).slice(0, 2)).toEqual(['u1:A CC A', 'u2:L LL L']);
        expect(computeProgress(tree, done).currentLessonId).toBeNull();
    });

    it('opens the next unit when the checkpoint is passed', () => {
        const p = learner({
            completedLessonIds: new Set(['u1-l1', 'u1-l2']),
            passedCheckpointIds: new Set(['u1-cp']),
        });
        expect(picture(p).slice(0, 2)).toEqual(['u1:C CC C', 'u2:A AL L']);
        expect(computeProgress(tree, p).currentLessonId).toBe('u2-l1');
    });

    it('clears a unit without checkpoint by finishing its lessons', () => {
        const p = learner({
            startUnitId: 'u3',
            completedLessonIds: new Set(['u3-l1', 'u3-l2']),
        });
        expect(picture(p).slice(2)).toEqual(['u3:C CC', 'u4:A A L']);
    });

    it('starts from the placement unit with everything before it cleared', () => {
        expect(picture(learner({ startUnitId: 'u2' }))).toEqual([
            'u1:C AA A',
            'u2:A AL L',
            'u3:L LL',
            'u4:L L L',
        ]);
    });

    it('treats an unknown start unit as the first', () => {
        expect(picture(learner({ startUnitId: 'gone' }))[0]).toBe('u1:A AL L');
    });

    it('opens a skipped unit and the one after it', () => {
        expect(picture(learner({ skippedUnitIds: new Set(['u2']) }))).toEqual([
            'u1:A AL L',
            'u2:C AA A',
            'u3:A AL',
            'u4:L L L',
        ]);
    });

    it('keeps a passed unit fully open when a release adds a lesson to it', () => {
        const p = learner({
            completedLessonIds: new Set(['u1-l1']),
            passedCheckpointIds: new Set(['u1-cp']),
        });
        expect(picture(p)[0]).toBe('u1:C CA C');
    });
});

describe('tree lookups', () => {
    it('finds units and the unit of a lesson', () => {
        expect(findUnit(tree, 'u3')?.stage.id).toBe('s2');
        expect(findUnit(tree, 'nope')).toBeNull();
        expect(findLessonUnit(tree, 'u2-l2')?.id).toBe('u2');
        expect(findLessonUnit(tree, 'nope')).toBeNull();
    });
});
