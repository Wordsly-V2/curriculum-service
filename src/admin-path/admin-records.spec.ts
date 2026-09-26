import { loadContent } from '@/content/content-loader';
import { toSeedRecords, type SeedRecord } from '@/content/content-records';
import { parseAdminRecord } from './admin-records';

describe('parseAdminRecord', () => {
    let seeds: SeedRecord[];
    beforeAll(async () => {
        const { corpus, errors } = await loadContent();
        expect(errors).toEqual([]);
        seeds = toSeedRecords(corpus);
    });

    it.each(['unit', 'item', 'dialogue', 'lesson', 'checkpoint'] as const)(
        'hashes a %s exactly like the importer',
        (kind) => {
            const imported = seeds.find((s) => s.kind === kind);
            expect(imported).toBeDefined();
            // Round-trip through JSON, as a request body would arrive.
            const body: unknown = JSON.parse(JSON.stringify(imported!.record));
            const parsed = parseAdminRecord(kind, body);
            expect(parsed).toMatchObject({ ok: true });
            if (!parsed.ok) return;
            expect(parsed.seed.hash).toBe(imported!.hash);
            expect(parsed.seed.id).toBe(imported!.id);
        },
    );

    it('rejects a body that is not an object', () => {
        expect(parseAdminRecord('item', [])).toEqual({
            ok: false,
            errors: ['(body): expected an object'],
        });
    });

    it('reports missing references and schema problems together', () => {
        const parsed = parseAdminRecord('lesson', { slug: 'x', title: 'X' });
        expect(parsed.ok).toBe(false);
        if (parsed.ok) return;
        const fields = parsed.errors.map((e) => e.split(':')[0]);
        expect(fields).toEqual(
            expect.arrayContaining(['unit', 'order', 'titleVi', 'steps']),
        );
    });

    it('refuses fields the seed does not have', () => {
        const item = seeds.find((s) => s.kind === 'item')!;
        const parsed = parseAdminRecord('item', {
            ...item.record,
            status: 'PUBLISHED',
        });
        expect(parsed.ok).toBe(false);
    });
});
