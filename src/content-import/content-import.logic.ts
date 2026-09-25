import { contentHash } from '@/content/content-hash';
import { contentId } from '@/content/content-id';
import type {
    CheckpointSeed,
    ContentCorpus,
    DialogueSeed,
    ItemSeed,
    LessonSeed,
    StageSeed,
    UnitFile,
} from '@/content/content.schema';

/**
 * Pure half of `npm run content:import`: turn the seed into one record per
 * content row, and decide per row whether to insert, update, skip or report a
 * conflict, from the hashes already in the database.
 *
 * Each record is in seed shape (references by slug), which is what gets hashed.
 * A lesson's record includes its steps and item links, so they are written
 * together.
 */

export type UnitRecord = Omit<
    UnitFile,
    'items' | 'dialogues' | 'lessons' | 'checkpoint'
>;
export type ItemRecord = ItemSeed & { unit: string };
export type DialogueRecord = DialogueSeed & { unit: string };
/** `order` is the lesson's position in its unit, from 1. */
export type LessonRecord = LessonSeed & { unit: string; order: number };
export type CheckpointRecord = CheckpointSeed & { unit: string };

interface Seed<K extends string, R> {
    kind: K;
    slug: string;
    id: string;
    hash: string;
    record: R;
}

export type SeedRecord =
    | Seed<'stage', StageSeed>
    | Seed<'unit', UnitRecord>
    | Seed<'item', ItemRecord>
    | Seed<'dialogue', DialogueRecord>
    | Seed<'lesson', LessonRecord>
    | Seed<'checkpoint', CheckpointRecord>;

export type ContentTable = SeedRecord['kind'];

/** Parents before children, so foreign keys hold at every write. */
export const IMPORT_ORDER: readonly ContentTable[] = [
    'stage',
    'unit',
    'item',
    'dialogue',
    'lesson',
    'checkpoint',
];

function seed<K extends ContentTable, R extends { slug: string }>(
    kind: K,
    record: R,
): Seed<K, R> {
    return {
        kind,
        slug: record.slug,
        id: contentId(kind, record.slug),
        hash: contentHash(record),
        record,
    };
}

/** Every row the corpus describes, in IMPORT_ORDER. */
export function toSeedRecords(corpus: ContentCorpus): SeedRecord[] {
    const records: SeedRecord[] = corpus.stages.map((stage) =>
        seed('stage', stage),
    );

    for (const unit of corpus.units) {
        const {
            items,
            dialogues,
            lessons,
            checkpoint,
            ...unitRecord
        }: UnitFile = unit;
        const ref = { unit: unit.slug };

        records.push(seed('unit', unitRecord));
        records.push(...items.map((item) => seed('item', { ...item, ...ref })));
        records.push(
            ...dialogues.map((dialogue) =>
                seed('dialogue', { ...dialogue, ...ref }),
            ),
        );
        records.push(
            ...lessons.map((lesson, index) =>
                seed('lesson', { ...lesson, ...ref, order: index + 1 }),
            ),
        );
        if (checkpoint)
            records.push(seed('checkpoint', { ...checkpoint, ...ref }));
    }

    const rank = (kind: ContentTable) => IMPORT_ORDER.indexOf(kind);
    // Array.prototype.sort is stable: file order is kept within a kind.
    return records.sort((a, b) => rank(a.kind) - rank(b.kind));
}

/** What the database holds for a row, as far as the importer cares. */
export interface ExistingRow {
    kind: ContentTable;
    slug: string;
    contentHash: string;
    /** Hash of the seed at the last import; null for rows an admin created. */
    seedHash: string | null;
}

export type PlanAction = 'insert' | 'update' | 'skip' | 'conflict';

export type PlanReason =
    | 'new'
    | 'seed-changed' // row untouched since the last import, seed moved on
    | 'forced' // admin edit overwritten by --force
    | 'adopt' // admin edit already equals the seed; record it as seeded
    | 'unchanged'
    | 'admin-edit-kept' // admin edited the row, the seed did not change
    | 'admin-edited'; // both changed: needs --force or a manual merge

export interface PlanEntry {
    action: PlanAction;
    reason: PlanReason;
    seed: SeedRecord;
}

/**
 * Decides each row. `force` holds slugs (any kind) or `kind:slug` whose admin
 * edits the seed may overwrite. Rows only in the database are left alone.
 */
export function planImport(
    seeds: SeedRecord[],
    existing: ExistingRow[],
    force: ReadonlySet<string> = new Set(),
): PlanEntry[] {
    const rows = new Map(
        existing.map((row) => [`${row.kind}:${row.slug}`, row]),
    );

    return seeds.map((seed) => {
        const key = `${seed.kind}:${seed.slug}`;
        const row = rows.get(key);
        const entry = (action: PlanAction, reason: PlanReason): PlanEntry => ({
            action,
            reason,
            seed,
        });

        if (!row) return entry('insert', 'new');

        if (seed.hash === row.contentHash) {
            return row.seedHash === seed.hash
                ? entry('skip', 'unchanged')
                : entry('update', 'adopt');
        }

        const adminEdited = row.contentHash !== row.seedHash;
        if (!adminEdited) return entry('update', 'seed-changed');
        if (force.has(seed.slug) || force.has(key)) {
            return entry('update', 'forced');
        }
        if (seed.hash === row.seedHash) return entry('skip', 'admin-edit-kept');
        return entry('conflict', 'admin-edited');
    });
}

export function summarizePlan(plan: PlanEntry[]): Record<PlanAction, number> {
    const summary = { insert: 0, update: 0, skip: 0, conflict: 0 };
    for (const entry of plan) summary[entry.action] += 1;
    return summary;
}
