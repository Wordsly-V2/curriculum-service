import { createHash } from 'node:crypto';

/**
 * JSON with object keys sorted at every level and `undefined` members dropped,
 * so equal content always serialises (and hashes) the same.
 */
export function stableStringify(value: unknown): string {
    return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((entry) => sortKeys(entry ?? null));
    }
    if (value !== null && typeof value === 'object') {
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(value).sort()) {
            const entry = (value as Record<string, unknown>)[key];
            if (entry !== undefined) out[key] = sortKeys(entry);
        }
        return out;
    }
    return value;
}

/**
 * sha256 (hex) of a content record in its seed shape (references by slug).
 * Both the importer and admin edits must hash that same shape, or every edit
 * would look like a conflict.
 */
export function contentHash(record: unknown): string {
    return createHash('sha256').update(stableStringify(record)).digest('hex');
}
