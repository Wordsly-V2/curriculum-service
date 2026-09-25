import { join } from 'node:path';
import { Prisma } from '@prisma/client';
import { loadContent } from './content-loader';
import { type SeedRecord, toSeedRecords } from './content-records';
import {
    type WorkingCopy,
    checkpointColumns,
    dialogueColumns,
    itemColumns,
    lessonChildren,
    lessonColumns,
    rowsToCorpus,
    stageColumns,
    unitColumns,
} from './content-rows';

/** What the importer would leave in the database for these records. */
function toRows(seeds: SeedRecord[]): WorkingCopy {
    const rows: WorkingCopy = {
        stages: [],
        units: [],
        items: [],
        dialogues: [],
        lessons: [],
        checkpoints: [],
    };
    const base = (seed: SeedRecord) => ({
        id: seed.id,
        slug: seed.slug,
        status: 'DRAFT',
        contentHash: seed.hash,
        seedHash: seed.hash,
        updatedBy: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
    });
    // Prisma.DbNull is how a create says "SQL NULL"; a read returns null.
    const dbNull = <T>(value: T) => (value === Prisma.DbNull ? null : value);

    for (const seed of seeds) {
        switch (seed.kind) {
            case 'stage':
                rows.stages.push({
                    ...base(seed),
                    ...stageColumns(seed.record),
                });
                break;
            case 'unit':
                rows.units.push({ ...base(seed), ...unitColumns(seed.record) });
                break;
            case 'item': {
                const columns = itemColumns(seed.record);
                rows.items.push({
                    ...base(seed),
                    ...columns,
                    pattern: dbNull(columns.pattern),
                    grammar: dbNull(columns.grammar),
                } as never);
                break;
            }
            case 'dialogue':
                rows.dialogues.push({
                    ...base(seed),
                    ...dialogueColumns(seed.record),
                } as never);
                break;
            case 'lesson': {
                const { steps, items } = lessonChildren(seed.record);
                rows.lessons.push({
                    ...base(seed),
                    ...lessonColumns(seed.record),
                    steps: steps.map((s) => ({ ...s, lessonId: seed.id })),
                    items: items.map((i) => ({ ...i, lessonId: seed.id })),
                } as never);
                break;
            }
            case 'checkpoint':
                rows.checkpoints.push({
                    ...base(seed),
                    ...checkpointColumns(seed.record),
                } as never);
                break;
        }
    }
    return rows;
}

const hashes = (seeds: SeedRecord[]) =>
    Object.fromEntries(seeds.map((s) => [`${s.kind}:${s.slug}`, s.hash]));

describe('rowsToCorpus', () => {
    let seeds: SeedRecord[];

    beforeAll(async () => {
        const { corpus, errors } = await loadContent(
            join(__dirname, '../../content'),
        );
        expect(errors).toEqual([]);
        seeds = toSeedRecords(corpus);
    });

    it('round-trips the shipped seed to the same hashes', () => {
        const { corpus, errors } = rowsToCorpus(toRows(seeds));
        expect(errors).toEqual([]);
        expect(hashes(toSeedRecords(corpus))).toEqual(hashes(seeds));
    });

    it('does not depend on row order', () => {
        const rows = toRows(seeds);
        for (const list of Object.values(rows)) (list as unknown[]).reverse();
        rows.lessons.forEach((l) => {
            l.steps.reverse();
            l.items.reverse();
        });
        expect(hashes(toSeedRecords(rowsToCorpus(rows).corpus))).toEqual(
            hashes(seeds),
        );
    });

    it('reports a lesson linking an item that is no longer there', () => {
        const rows = toRows(seeds);
        const [archived] = rows.items.splice(0, 1);
        const { errors } = rowsToCorpus(rows);
        expect(errors).toEqual(
            expect.arrayContaining([
                expect.stringContaining(
                    `links item ${archived.id}, which is archived or missing`,
                ),
            ]),
        );
    });

    it('validates rows with the seed schema', () => {
        const rows = toRows(seeds);
        rows.lessons[0].steps[0].payload = { schemaVersion: 2 };
        const { errors } = rowsToCorpus(rows);
        expect(
            errors.some((e) =>
                e.startsWith(`unit ${rows.units[0].slug} lessons.0.steps.0`),
            ),
        ).toBe(true);
    });

    it('reports rows outside any unit', () => {
        const rows = toRows(seeds);
        rows.items[0].unitId = null;
        expect(rowsToCorpus(rows).errors).toContain(
            `item ${rows.items[0].slug}: not in any unit`,
        );
    });
});
