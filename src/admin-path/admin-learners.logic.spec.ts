import type { TreeSnapshot } from '@/release/release.logic';
import {
    fillDailyCounts,
    flattenLessons,
    reachedStage,
    resolveRange,
    stageByUnit,
} from './admin-learners.logic';

const lesson = (id: string, order: number) => ({
    id,
    slug: id,
    order,
    title: `Lesson ${id}`,
    titleVi: '',
    estimatedMinutes: 5,
    newItemCount: 3,
});

const unit = (id: string, order: number, lessons: string[]) => ({
    id,
    slug: id,
    order,
    title: `Unit ${id}`,
    titleVi: '',
    canDo: [],
    lessons: lessons.map((l, i) => lesson(l, i + 1)).reverse(),
    checkpointId: null,
});

// Deliberately out of order: the tree's `order` fields, not array order, rule.
const TREE: TreeSnapshot = {
    snapshotVersion: 1,
    stages: [
        {
            id: 'a1',
            slug: 'a1',
            cefr: 'A1',
            order: 2,
            title: 'A1',
            titleVi: '',
            units: [unit('u3', 1, ['l5'])],
        },
        {
            id: 'pre',
            slug: 'pre',
            cefr: 'PRE_A1',
            order: 1,
            title: 'Pre',
            titleVi: '',
            units: [unit('u2', 2, ['l3', 'l4']), unit('u1', 1, ['l1', 'l2'])],
        },
    ],
};

describe('admin learners logic', () => {
    it('resolveRange defaults to the last 30 days and caps the span', () => {
        expect(resolveRange(undefined, undefined, '2026-09-26')).toEqual({
            from: '2026-08-28',
            to: '2026-09-26',
        });
        expect(resolveRange('2025-01-01', '2026-01-01')).toMatch(/at most/);
        expect(resolveRange('2026-02-01', '2026-01-01')).toMatch(/after/);
    });

    it('fillDailyCounts has a point per day', () => {
        expect(
            fillDailyCounts({ from: '2026-09-01', to: '2026-09-03' }, [
                { date: '2026-09-03', count: 2 },
            ]).map((d) => d.count),
        ).toEqual([0, 0, 2]);
    });

    it('flattenLessons follows stage, unit and lesson order', () => {
        const lessons = flattenLessons(TREE);
        expect(lessons.map((l) => l.lessonId)).toEqual([
            'l1',
            'l2',
            'l3',
            'l4',
            'l5',
        ]);
        expect(lessons[4]).toMatchObject({
            unitId: 'u3',
            stageId: 'a1',
            cefr: 'A1',
            position: 5,
        });
    });

    describe('reachedStage', () => {
        const lessons = flattenLessons(TREE);

        it('uses the furthest completed lesson', () => {
            expect(
                reachedStage(TREE, lessons, new Set(['l1', 'l5']), null),
            ).toBe('a1');
        });

        it('falls back to the start unit, then the first stage', () => {
            expect(reachedStage(TREE, lessons, new Set(), 'u3')).toBe('a1');
            expect(reachedStage(TREE, lessons, new Set(), null)).toBe('pre');
        });

        it('is null when the start unit left the release', () => {
            expect(reachedStage(TREE, lessons, new Set(), 'gone')).toBeNull();
        });
    });

    it('stageByUnit maps every unit', () => {
        expect(Object.fromEntries(stageByUnit(TREE))).toEqual({
            u1: 'pre',
            u2: 'pre',
            u3: 'a1',
        });
    });
});
