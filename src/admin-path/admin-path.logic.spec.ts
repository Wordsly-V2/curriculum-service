import { buildAdminTree, rowOrigin, type AdminRows } from './admin-path.logic';

const at = new Date('2026-09-25T00:00:00Z');
const row = <T extends object>(id: string, extra: T) => ({
    id,
    slug: id,
    status: 'PUBLISHED',
    contentHash: 'h',
    seedHash: 'h' as string | null,
    updatedAt: at,
    ...extra,
});

describe('rowOrigin', () => {
    it('tells seeded, edited and admin-created rows apart', () => {
        expect(rowOrigin({ contentHash: 'a', seedHash: 'a' })).toBe('seed');
        expect(rowOrigin({ contentHash: 'b', seedHash: 'a' })).toBe('edited');
        expect(rowOrigin({ contentHash: 'b', seedHash: null })).toBe('admin');
    });
});

describe('buildAdminTree', () => {
    const rows: AdminRows = {
        stages: [
            row('s2', { order: 2, title: 'A1', cefr: 'A1' }),
            row('s1', { order: 1, title: 'Pre-A1', cefr: 'PRE_A1' }),
        ],
        units: [
            row('u2', { stageId: 's1', order: 2, title: 'Two' }),
            row('u1', { stageId: 's1', order: 1, title: 'One' }),
        ],
        lessons: [
            row('l2', {
                unitId: 'u1',
                order: 2,
                title: 'L2',
                status: 'DRAFT',
                seedHash: null,
            }),
            row('l1', { unitId: 'u1', order: 1, title: 'L1' }),
        ],
        items: [
            row('i3', {
                unitId: 'u1',
                status: 'ARCHIVED',
                type: 'LEXICAL',
                text: 'c',
            }),
            row('i1', { unitId: 'u1', type: 'LEXICAL', text: 'a' }),
            row('i2', {
                unitId: 'u1',
                status: 'DRAFT',
                contentHash: 'x',
                type: 'PHRASE',
                text: 'b',
            }),
        ],
        dialogues: [row('d1', { unitId: 'u1', title: 'Hi' })],
        checkpoints: [row('c1', { unitId: 'u1' })],
        placements: [
            row('p1', { title: 'Placement', questions: [{}, {}, {}] }),
        ],
    };
    const tree = buildAdminTree(rows);

    it('orders stages, units and lessons', () => {
        expect(tree.stages.map((s) => s.id)).toEqual(['s1', 's2']);
        expect(tree.stages[0].units.map((u) => u.id)).toEqual(['u1', 'u2']);
        expect(tree.stages[0].units[0].lessons.map((l) => l.id)).toEqual([
            'l1',
            'l2',
        ]);
        expect(tree.stages[1].units).toEqual([]);
    });

    it('summarises a unit and tags each node', () => {
        const unit = tree.stages[0].units[0];
        expect(unit.items).toEqual({ total: 3, draft: 1, edited: 1 });
        expect(unit.dialogueCount).toBe(1);
        expect(unit.itemList.map((i) => [i.slug, i.text, i.origin])).toEqual([
            ['i1', 'a', 'seed'],
            ['i2', 'b', 'edited'],
            ['i3', 'c', 'seed'],
        ]);
        expect(unit.dialogues).toEqual([
            expect.objectContaining({ slug: 'd1', title: 'Hi' }),
        ]);
        expect(unit.checkpoint).toMatchObject({ id: 'c1', origin: 'seed' });
        expect(unit.lessons[1]).toMatchObject({
            status: 'DRAFT',
            origin: 'admin',
        });
        expect(tree.stages[0].units[1].checkpoint).toBeNull();
    });

    it('lists placement tests with their question count', () => {
        expect(tree.placements).toEqual([
            expect.objectContaining({
                slug: 'p1',
                title: 'Placement',
                questionCount: 3,
                origin: 'seed',
            }),
        ]);
    });

    it('counts every row by status and origin', () => {
        expect(tree.totals).toEqual({
            DRAFT: 2,
            PUBLISHED: 9,
            ARCHIVED: 1,
            seed: 10,
            edited: 1,
            admin: 1,
        });
    });
});
