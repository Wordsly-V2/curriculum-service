import { join } from 'node:path';
import { contentId, stepId } from '@/content/content-id';
import { loadContent } from '@/content/content-loader';
import type { ContentCorpus } from '@/content/content.schema';
import {
    SNAPSHOT_VERSION,
    buildRelease,
    chunk,
    retiredItemIds,
} from './release.logic';

describe('buildRelease', () => {
    let corpus: ContentCorpus;

    beforeAll(async () => {
        const loaded = await loadContent(join(__dirname, '../../content'));
        expect(loaded.errors).toEqual([]);
        corpus = loaded.corpus;
    });

    it('builds the tree in learning order with ids', () => {
        const { tree } = buildRelease(corpus);
        expect(tree.snapshotVersion).toBe(SNAPSHOT_VERSION);
        expect(tree.stages.map((s) => s.order)).toEqual(
            [...tree.stages.map((s) => s.order)].sort((a, b) => a - b),
        );
        const unit = tree.stages[0].units[0];
        expect(unit.id).toBe(contentId('unit', 'pre-a1-01-hello'));
        expect(unit.checkpointId).toBe(
            contentId('checkpoint', 'pre-a1-01-checkpoint'),
        );
        expect(
            unit.lessons
                .slice(0, 2)
                .map((l) => [l.slug, l.order, l.newItemCount]),
        ).toEqual([
            ['pre-a1-01-l1-greetings', 1, 5],
            ['pre-a1-01-l2-names', 2, 5],
        ]);
    });

    it('hydrates lesson items with their role', () => {
        const { lessons } = buildRelease(corpus);
        const l2 = lessons.find(
            (l) => l.payload.slug === 'pre-a1-01-l2-names',
        )!;
        expect(l2.lessonId).toBe(contentId('lesson', 'pre-a1-01-l2-names'));
        expect(l2.unitId).toBe(contentId('unit', 'pre-a1-01-hello'));
        const hello = l2.payload.items.find((i) => i.slug === 'hello')!;
        expect(hello).toMatchObject({
            id: contentId('item', 'hello'),
            role: 'RECYCLE',
            meaningVi: 'xin chào',
        });
    });

    it('replaces slug references in steps with ids', () => {
        const { lessons } = buildRelease(corpus);
        const l2 = lessons.find(
            (l) => l.payload.slug === 'pre-a1-01-l2-names',
        )!.payload;
        const byType = (type: string) => l2.steps.find((s) => s.type === type)!;

        expect(l2.steps[0].id).toBe(stepId('pre-a1-01-l2-names', 0));
        expect(byType('INTRO').payload).toMatchObject({
            itemIds: expect.arrayContaining([
                contentId('item', 'my-name-is'),
            ]) as unknown,
        });
        expect(byType('INTRO').payload).not.toHaveProperty('items');
        expect(byType('PATTERN_DRILL').payload).toMatchObject({
            patternId: contentId('item', 'my-name-is'),
        });
        expect(byType('DIALOGUE').payload).toMatchObject({
            mode: 'roleplay',
            dialogue: {
                id: contentId('dialogue', 'pre-a1-01-first-day'),
                lines: expect.any(Array) as unknown,
            },
        });
        const quiz = byType('QUIZ').payload as {
            questions: { itemId?: string; item?: string }[];
        };
        expect(quiz.questions[0].itemId).toBe(
            contentId('item', 'im-fine-thanks'),
        );
        expect(quiz.questions[0]).not.toHaveProperty('item');
    });

    it('snapshots checkpoints and lists every item id', () => {
        const { checkpoints, items } = buildRelease(corpus);
        const itemIds = items.map((i) => i.itemId);
        expect(checkpoints).toHaveLength(
            corpus.units.filter((u) => u.checkpoint).length,
        );
        expect(checkpoints[0].payload).toMatchObject({
            passPercent: 70,
            unitId: contentId('unit', 'pre-a1-01-hello'),
        });
        expect(checkpoints[0].payload.questions.every((q) => q.itemId)).toBe(
            true,
        );
        expect(itemIds).toHaveLength(
            corpus.units.flatMap((u) => u.items).length,
        );
        expect(itemIds).toContain(contentId('item', 'thank-you'));
        expect(
            items.find((i) => i.payload.slug === 'hi')?.payload,
        ).toMatchObject({
            id: contentId('item', 'hi'),
            meaningVi: 'chào (thân mật)',
        });
        expect(items[0].payload).not.toHaveProperty('role');
    });

    it('snapshots the placement test with unit and item ids', () => {
        const { placement, tree } = buildRelease(corpus);
        const unitIds = new Set(
            tree.stages.flatMap((s) => s.units.map((u) => u.id)),
        );
        expect(placement?.placementId).toBe(
            contentId('placement', 'path-placement'),
        );
        const questions = placement!.payload.questions;
        expect(questions).toHaveLength(corpus.placement!.questions.length);
        expect(questions.every((q) => unitIds.has(q.unitId))).toBe(true);
        expect(questions[0]).not.toHaveProperty('unit');
        expect(questions[0].itemId).toBe(
            contentId('item', corpus.placement!.questions[0].item!),
        );
    });

    it('has no placement when the corpus has none', () => {
        const { placement } = buildRelease({ ...corpus, placement: undefined });
        expect(placement).toBeNull();
    });

    it('is deterministic', () => {
        expect(JSON.stringify(buildRelease(corpus))).toBe(
            JSON.stringify(buildRelease(corpus)),
        );
    });
});

describe('retiredItemIds', () => {
    it('lists what the previous release had and the next one lacks', () => {
        expect(retiredItemIds(['a', 'b', 'c'], ['a', 'c', 'd'])).toEqual(['b']);
    });

    it('is empty for a first release or when nothing was dropped', () => {
        expect(retiredItemIds([], ['a'])).toEqual([]);
        expect(retiredItemIds(['a'], ['a', 'b'])).toEqual([]);
    });

    it('lists each id once', () => {
        expect(retiredItemIds(['x', 'x'], [])).toEqual(['x']);
    });
});

describe('chunk', () => {
    it('splits into batches of at most `size`', () => {
        expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
        expect(chunk([], 3)).toEqual([]);
    });
});
