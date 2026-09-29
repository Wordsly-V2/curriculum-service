import { planReorder } from './admin-reorder.logic';

const rows = [
    { slug: 'a', order: 1 },
    { slug: 'b', order: 2 },
    { slug: 'c', order: 4 },
];

describe('planReorder', () => {
    it('changes only the rows that move, reusing their positions', () => {
        expect(planReorder(rows, ['a', 'c', 'b'])).toEqual({
            ok: true,
            changes: [
                { slug: 'c', order: 2 },
                { slug: 'b', order: 4 },
            ],
        });
    });

    it('moving back restores every order', () => {
        const moved = [
            { slug: 'a', order: 1 },
            { slug: 'c', order: 2 },
            { slug: 'b', order: 4 },
        ];
        expect(planReorder(moved, ['a', 'b', 'c'])).toEqual({
            ok: true,
            changes: [
                { slug: 'b', order: 2 },
                { slug: 'c', order: 4 },
            ],
        });
    });

    it('the same order changes nothing', () => {
        expect(planReorder(rows, ['a', 'b', 'c'])).toEqual({
            ok: true,
            changes: [],
        });
    });

    it('numbers shared positions afresh', () => {
        const shared = [
            { slug: 'a', order: 1 },
            { slug: 'b', order: 1 },
        ];
        expect(planReorder(shared, ['b', 'a'])).toEqual({
            ok: true,
            changes: [{ slug: 'a', order: 2 }],
        });
    });

    it.each([
        [['a', 'b']],
        [['a', 'b', 'c', 'd']],
        [['a', 'b', 'b']],
        [['a', 'b', 'x']],
    ])('refuses a list that is not exactly the rows: %j', (slugs) => {
        expect(planReorder(rows, slugs).ok).toBe(false);
    });
});
