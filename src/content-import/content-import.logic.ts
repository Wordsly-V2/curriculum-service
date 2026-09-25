import type { ContentTable, SeedRecord } from '@/content/content-records';

/**
 * Pure half of `npm run content:import`: decide per seed record (see
 * `toSeedRecords`) whether to insert, update, skip or report a conflict, from
 * the hashes already in the database.
 */

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
