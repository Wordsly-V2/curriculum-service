import { createHash } from 'node:crypto';

/**
 * Namespace for every Wordsly Path content id. Changing it (or the name format
 * below) would re-key every FSRS card in learning-service: never do it.
 */
export const CONTENT_ID_NAMESPACE = '6f1c2a4e-8d3b-4c7a-9e5f-2b8d0c4a1e73';

export type ContentKind =
    | 'stage'
    | 'unit'
    | 'lesson'
    | 'step'
    | 'item'
    | 'dialogue'
    | 'checkpoint'
    | 'placement';

/** RFC 4122 §4.3 name-based UUID (version 5, SHA-1). */
export function uuidv5(name: string, namespace: string): string {
    const ns = Buffer.from(namespace.replace(/-/g, ''), 'hex');
    if (ns.length !== 16) {
        throw new Error(`Invalid namespace UUID: ${namespace}`);
    }

    const bytes = createHash('sha1')
        .update(ns)
        .update(name, 'utf8')
        .digest()
        .subarray(0, 16);
    bytes[6] = (bytes[6] & 0x0f) | 0x50; // version 5
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // RFC 4122 variant

    const hex = bytes.toString('hex');
    return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20),
    ].join('-');
}

/** Stable id of a content row: uuidv5 of `<kind>:<slug>`. */
export function contentId(kind: ContentKind, slug: string): string {
    return uuidv5(`${kind}:${slug}`, CONTENT_ID_NAMESPACE);
}

/** Steps have no slug of their own; they are keyed by lesson and position. */
export function stepId(lessonSlug: string, order: number): string {
    return contentId('step', `${lessonSlug}#${order}`);
}
