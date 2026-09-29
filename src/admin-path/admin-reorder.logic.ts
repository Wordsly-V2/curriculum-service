/**
 * Pure half of `POST /admin/path/reorder`: the new order of a stage's units or
 * a unit's lessons. The live rows keep the positions they already hold, handed
 * out again in the new sequence, so moving a row and moving it back restores
 * every `order` (and so every hash), and only the rows that moved change.
 */

export interface OrderedRow {
    slug: string;
    order: number;
}

export type ReorderPlan =
    | { ok: true; changes: OrderedRow[] }
    | { ok: false; error: string };

export function planReorder(
    current: readonly OrderedRow[],
    slugs: readonly string[],
): ReorderPlan {
    const have = new Set(current.map((r) => r.slug));
    const asked = new Set(slugs);
    if (
        asked.size !== slugs.length ||
        asked.size !== have.size ||
        slugs.some((s) => !have.has(s))
    ) {
        return {
            ok: false,
            error: 'The list does not match what is there now; reload and try again',
        };
    }
    const positions = current.map((r) => r.order).sort((a, b) => a - b);
    // Shared positions would stay shared: number them afresh instead.
    const unique = new Set(positions).size === positions.length;
    const order = new Map(current.map((r) => [r.slug, r.order]));
    const changes = slugs
        .map((slug, i) => ({ slug, order: unique ? positions[i] : i + 1 }))
        .filter((r) => order.get(r.slug) !== r.order);
    return { ok: true, changes };
}
