import { contentHash } from '@/content/content-hash';
import { contentId } from '@/content/content-id';
import type { ContentCorpus } from '@/content/content.schema';
import {
    type ExistingRow,
    type SeedRecord,
    planImport,
    summarizePlan,
    toSeedRecords,
} from './content-import.logic';

const corpus: ContentCorpus = {
    stages: [
        { slug: 's1', cefr: 'PRE_A1', order: 1, title: 's', titleVi: 's' },
    ],
    units: [
        {
            slug: 'u1',
            stage: 's1',
            order: 1,
            title: 'u',
            titleVi: 'u',
            canDo: ['x'],
            items: [
                {
                    slug: 'hi',
                    type: 'LEXICAL',
                    text: 'hi',
                    meaningVi: 'chào',
                    examples: [],
                },
            ],
            dialogues: [
                {
                    slug: 'd1',
                    title: 'd',
                    situationVi: 'd',
                    lines: [
                        { speaker: 'A', en: 'Hi', vi: 'Chào' },
                        { speaker: 'B', en: 'Hi', vi: 'Chào' },
                    ],
                },
            ],
            lessons: [
                {
                    slug: 'l1',
                    title: 'l',
                    titleVi: 'l',
                    estimatedMinutes: 5,
                    items: [{ item: 'hi', role: 'INTRODUCE' }],
                    steps: [
                        {
                            type: 'INTRO',
                            payload: { schemaVersion: 1, items: ['hi'] },
                        },
                    ],
                },
                {
                    slug: 'l2',
                    title: 'l',
                    titleVi: 'l',
                    estimatedMinutes: 5,
                    items: [],
                    steps: [
                        {
                            type: 'WARMUP',
                            payload: { schemaVersion: 1, maxItems: 5 },
                        },
                    ],
                },
            ],
            checkpoint: {
                slug: 'cp1',
                passPercent: 70,
                questions: [{ kind: 'order', vi: 'x', answer: 'x' }],
            },
        },
    ],
};

describe('toSeedRecords', () => {
    const seeds = toSeedRecords(corpus);

    it('lists parents before children', () => {
        expect(seeds.map((s) => `${s.kind}:${s.slug}`)).toEqual([
            'stage:s1',
            'unit:u1',
            'item:hi',
            'dialogue:d1',
            'lesson:l1',
            'lesson:l2',
            'checkpoint:cp1',
        ]);
    });

    it('derives ids from kind and slug, and hashes the seed-shaped record', () => {
        const lesson = seeds.find((s) => s.slug === 'l2')!;
        expect(lesson.id).toBe(contentId('lesson', 'l2'));
        expect(lesson.record).toMatchObject({ unit: 'u1', order: 2 });
        expect(lesson.hash).toBe(contentHash(lesson.record));
    });

    it('keeps child collections out of the unit record', () => {
        const unit = seeds.find((s) => s.kind === 'unit')!;
        expect(Object.keys(unit.record).sort()).toEqual(
            ['canDo', 'order', 'slug', 'stage', 'title', 'titleVi'].sort(),
        );
    });

    it('is stable: the same corpus gives the same hashes', () => {
        expect(
            toSeedRecords(structuredClone(corpus)).map((s) => s.hash),
        ).toEqual(seeds.map((s) => s.hash));
    });
});

describe('planImport', () => {
    const seed = toSeedRecords(corpus).find((s) => s.kind === 'item')!;
    const row = (
        contentHash: string,
        seedHash: string | null,
    ): ExistingRow => ({
        kind: 'item',
        slug: 'hi',
        contentHash,
        seedHash,
    });
    const decide = (existing: ExistingRow[], force?: Set<string>) => {
        const [entry] = planImport([seed], existing, force);
        return `${entry.action}/${entry.reason}`;
    };

    it('inserts new rows', () => {
        expect(decide([])).toBe('insert/new');
    });

    it('skips rows already matching the seed', () => {
        expect(decide([row(seed.hash, seed.hash)])).toBe('skip/unchanged');
    });

    it('updates rows no admin touched when the seed moved on', () => {
        expect(decide([row('old', 'old')])).toBe('update/seed-changed');
    });

    it('keeps an admin edit while the seed is unchanged', () => {
        expect(decide([row('edited', seed.hash)])).toBe('skip/admin-edit-kept');
    });

    it('reports a conflict when both changed, unless forced', () => {
        expect(decide([row('edited', 'old')])).toBe('conflict/admin-edited');
        expect(decide([row('edited', 'old')], new Set(['hi']))).toBe(
            'update/forced',
        );
        expect(decide([row('edited', 'old')], new Set(['item:hi']))).toBe(
            'update/forced',
        );
        expect(decide([row('edited', 'old')], new Set(['lesson:hi']))).toBe(
            'conflict/admin-edited',
        );
    });

    it('treats an admin-created row as edited', () => {
        expect(decide([row('admin', null)])).toBe('conflict/admin-edited');
    });

    it('adopts an admin edit that already equals the seed', () => {
        expect(decide([row(seed.hash, 'old')])).toBe('update/adopt');
    });

    it('matches rows by kind as well as slug', () => {
        expect(decide([{ ...row(seed.hash, seed.hash), kind: 'lesson' }])).toBe(
            'insert/new',
        );
    });
});

describe('summarizePlan', () => {
    it('counts actions', () => {
        const seeds = toSeedRecords(corpus);
        const existing: ExistingRow[] = seeds
            .slice(0, 2)
            .map((s: SeedRecord) => ({
                kind: s.kind,
                slug: s.slug,
                contentHash: s.hash,
                seedHash: s.hash,
            }));
        expect(summarizePlan(planImport(seeds, existing))).toEqual({
            insert: seeds.length - 2,
            update: 0,
            skip: 2,
            conflict: 0,
        });
    });
});
