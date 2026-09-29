import { seed } from '@/content/content-records';
import {
    conflictMessage,
    type ImportTarget,
    planAdminImport,
    summarizeAdminImport,
} from './admin-import.logic';

const unit = seed('unit', {
    slug: 'a1-01-family',
    stage: 'a1',
    order: 1,
    title: 'Family',
    titleVi: 'Gia đình',
    canDo: ['Giới thiệu gia đình'],
});
const item = (text: string) =>
    seed('item', {
        slug: 'mother',
        type: 'LEXICAL' as const,
        text,
        meaningVi: 'mẹ',
        examples: [],
        unit: 'a1-01-family',
    });

const row = (
    s: ReturnType<typeof item> | typeof unit,
    over: Partial<ImportTarget> = {},
): ImportTarget => ({
    kind: s.kind,
    slug: s.slug,
    status: 'PUBLISHED',
    contentHash: s.hash,
    seedHash: s.hash,
    unit: s.kind === 'unit' ? null : 'a1-01-family',
    ...over,
});

describe('planAdminImport', () => {
    it('inserts new rows and skips identical ones', () => {
        const plan = planAdminImport([unit, item('mother')], [row(unit)]);
        expect(plan.map((e) => [e.action, e.reason])).toEqual([
            ['skip', 'unchanged'],
            ['insert', 'new'],
        ]);
        expect(summarizeAdminImport(plan)).toEqual({
            insert: 1,
            update: 0,
            skip: 1,
            conflict: 0,
        });
    });

    it('lets the file win, and says when it replaces an admin edit', () => {
        const seeded = item('mother');
        const edited = row(seeded, { contentHash: 'edited' });
        expect(planAdminImport([item('mom')], [row(seeded)])[0]).toMatchObject({
            action: 'update',
            reason: 'changed',
        });
        expect(planAdminImport([item('mom')], [edited])[0]).toMatchObject({
            action: 'update',
            reason: 'replaces-edit',
        });
        // Re-importing the seed undoes the edit (the seed importer would keep it).
        expect(planAdminImport([seeded], [edited])[0].action).toBe('update');
    });

    it('refuses archived rows and slugs of another unit', () => {
        const s = item('mother');
        const archived = planAdminImport([s], [row(s, { status: 'ARCHIVED' })]);
        expect(archived[0]).toMatchObject({
            action: 'conflict',
            reason: 'archived',
        });
        expect(conflictMessage(archived[0])).toContain('restore it first');
        const moved = planAdminImport([s], [row(s, { unit: 'a1-02-home' })]);
        expect(moved[0]).toMatchObject({
            action: 'conflict',
            reason: 'other-unit',
        });
    });
});
