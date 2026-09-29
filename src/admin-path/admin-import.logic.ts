import type { SeedRecord } from '@/content/content-records';

/**
 * Pure half of `POST /admin/path/import`: an admin uploads one unit file in
 * seed shape and each of its records is decided against the working copy.
 * Unlike the seed importer (`planImport`), the file always wins over what is
 * there, since an admin chose to import it: an admin edit is replaced (and
 * flagged so the review says so), and re-importing the seed undoes an edit.
 * Rows the file does not mention are left alone.
 */

export type AdminImportAction = 'insert' | 'update' | 'skip' | 'conflict';

export type AdminImportReason =
    | 'new'
    | 'changed' // the row differs from the file and has no admin edit
    | 'replaces-edit' // the row carries an admin edit the file overwrites
    | 'unchanged'
    | 'archived' // restore it first, like a PUT
    | 'other-unit'; // the slug belongs to another unit's row

/** What the working copy holds for a slug the file names. */
export interface ImportTarget {
    kind: SeedRecord['kind'];
    slug: string;
    status: string;
    contentHash: string;
    seedHash: string | null;
    /** The unit a child row belongs to (by slug); null for stages and units. */
    unit: string | null;
}

export interface AdminImportEntry {
    action: AdminImportAction;
    reason: AdminImportReason;
    seed: SeedRecord;
}

export function planAdminImport(
    seeds: readonly SeedRecord[],
    existing: readonly ImportTarget[],
): AdminImportEntry[] {
    const rows = new Map(
        existing.map((row) => [`${row.kind}:${row.slug}`, row]),
    );
    return seeds.map((seed) => {
        const entry = (
            action: AdminImportAction,
            reason: AdminImportReason,
        ): AdminImportEntry => ({ action, reason, seed });
        const row = rows.get(`${seed.kind}:${seed.slug}`);
        if (!row) return entry('insert', 'new');
        const unit = 'unit' in seed.record ? seed.record.unit : null;
        if (seed.kind !== 'unit' && unit && row.unit !== unit) {
            return entry('conflict', 'other-unit');
        }
        if (row.status === 'ARCHIVED') return entry('conflict', 'archived');
        if (row.contentHash === seed.hash) return entry('skip', 'unchanged');
        return row.contentHash === row.seedHash
            ? entry('update', 'changed')
            : entry('update', 'replaces-edit');
    });
}

export function summarizeAdminImport(
    plan: readonly AdminImportEntry[],
): Record<AdminImportAction, number> {
    const summary = { insert: 0, update: 0, skip: 0, conflict: 0 };
    for (const entry of plan) summary[entry.action] += 1;
    return summary;
}

/** Why a conflicting entry blocks the import, said to the admin. */
export function conflictMessage(entry: AdminImportEntry): string {
    const what = `${entry.seed.kind} ${entry.seed.slug}`;
    return entry.reason === 'archived'
        ? `${what} is archived; restore it first`
        : `${what} already belongs to another unit; slugs are global, pick a new one`;
}
