import type { ContentStatus } from '@/content/content.schema';

/**
 * Pure half of the admin overview: the whole working copy (archived rows
 * included) as one tree, each node tagged with its status and where its
 * content came from.
 */

/**
 * - `seed`: content equals what the last import wrote (`contentHash == seedHash`)
 * - `edited`: an admin changed a seeded row; the importer will keep the edit
 * - `admin`: created by an admin, no seed behind it (`seedHash` null)
 */
export type RowOrigin = 'seed' | 'edited' | 'admin';

export function rowOrigin(row: {
    contentHash: string;
    seedHash: string | null;
}): RowOrigin {
    if (row.seedHash === null) return 'admin';
    return row.contentHash === row.seedHash ? 'seed' : 'edited';
}

interface Row {
    id: string;
    slug: string;
    status: string;
    contentHash: string;
    seedHash: string | null;
    updatedAt: Date;
}

export interface AdminNode {
    id: string;
    slug: string;
    status: ContentStatus;
    origin: RowOrigin;
    updatedAt: Date;
}

export interface AdminLessonNode extends AdminNode {
    order: number;
    title: string;
}

export interface AdminItemNode extends AdminNode {
    type: string;
    text: string;
}

export interface AdminDialogueNode extends AdminNode {
    title: string;
}

export interface AdminUnitNode extends AdminNode {
    order: number;
    title: string;
    lessons: AdminLessonNode[];
    items: { total: number; draft: number; edited: number };
    /** Every item of the unit, archived included, by slug. */
    itemList: AdminItemNode[];
    dialogues: AdminDialogueNode[];
    dialogueCount: number;
    checkpoint: AdminNode | null;
}

export interface AdminStageNode extends AdminNode {
    order: number;
    title: string;
    cefr: string;
    units: AdminUnitNode[];
}

export interface AdminPlacementNode extends AdminNode {
    title: string;
    questionCount: number;
}

export interface AdminTree {
    stages: AdminStageNode[];
    /** Placement tests, archived included; at most one is live. */
    placements: AdminPlacementNode[];
    /** Rows per status and origin across every table. */
    totals: Record<ContentStatus | RowOrigin, number>;
}

export interface AdminRows {
    stages: (Row & { order: number; title: string; cefr: string })[];
    units: (Row & { stageId: string; order: number; title: string })[];
    lessons: (Row & { unitId: string; order: number; title: string })[];
    items: (Row & { unitId: string | null; type: string; text: string })[];
    dialogues: (Row & { unitId: string; title: string })[];
    checkpoints: (Row & { unitId: string })[];
    placements: (Row & { title: string; questions: unknown })[];
}

function node(row: Row): AdminNode {
    return {
        id: row.id,
        slug: row.slug,
        status: row.status as ContentStatus,
        origin: rowOrigin(row),
        updatedAt: row.updatedAt,
    };
}

function groupBy<T, K>(rows: T[], key: (row: T) => K): Map<K, T[]> {
    const out = new Map<K, T[]>();
    for (const row of rows) {
        const k = key(row);
        out.set(k, [...(out.get(k) ?? []), row]);
    }
    return out;
}

const byOrder = (a: { order: number }, b: { order: number }) =>
    a.order - b.order;

export function buildAdminTree(rows: AdminRows): AdminTree {
    const lessonsByUnit = groupBy(rows.lessons, (l) => l.unitId);
    const itemsByUnit = groupBy(rows.items, (i) => i.unitId);
    const dialoguesByUnit = groupBy(rows.dialogues, (d) => d.unitId);
    const checkpointByUnit = new Map(
        rows.checkpoints.map((c) => [c.unitId, c]),
    );
    const unitsByStage = groupBy(rows.units, (u) => u.stageId);

    const stages = [...rows.stages].sort(byOrder).map((stage) => ({
        ...node(stage),
        order: stage.order,
        title: stage.title,
        cefr: stage.cefr,
        units: [...(unitsByStage.get(stage.id) ?? [])]
            .sort(byOrder)
            .map((unit): AdminUnitNode => {
                const items = itemsByUnit.get(unit.id) ?? [];
                const checkpoint = checkpointByUnit.get(unit.id);
                return {
                    ...node(unit),
                    order: unit.order,
                    title: unit.title,
                    lessons: [...(lessonsByUnit.get(unit.id) ?? [])]
                        .sort(byOrder)
                        .map((lesson) => ({
                            ...node(lesson),
                            order: lesson.order,
                            title: lesson.title,
                        })),
                    items: {
                        total: items.length,
                        draft: items.filter((i) => i.status === 'DRAFT').length,
                        edited: items.filter((i) => rowOrigin(i) !== 'seed')
                            .length,
                    },
                    itemList: [...items]
                        .sort((a, b) => a.slug.localeCompare(b.slug))
                        .map((i) => ({
                            ...node(i),
                            type: i.type,
                            text: i.text,
                        })),
                    dialogues: (dialoguesByUnit.get(unit.id) ?? []).map(
                        (d) => ({
                            ...node(d),
                            title: d.title,
                        }),
                    ),
                    dialogueCount: (dialoguesByUnit.get(unit.id) ?? []).length,
                    checkpoint: checkpoint ? node(checkpoint) : null,
                };
            }),
    }));

    const totals: AdminTree['totals'] = {
        DRAFT: 0,
        PUBLISHED: 0,
        ARCHIVED: 0,
        seed: 0,
        edited: 0,
        admin: 0,
    };
    for (const row of [
        ...rows.stages,
        ...rows.units,
        ...rows.lessons,
        ...rows.items,
        ...rows.dialogues,
        ...rows.checkpoints,
        ...rows.placements,
    ]) {
        totals[row.status as ContentStatus] += 1;
        totals[rowOrigin(row)] += 1;
    }

    const placements = [...rows.placements]
        .sort((a, b) => a.slug.localeCompare(b.slug))
        .map((p) => ({
            ...node(p),
            title: p.title,
            questionCount: Array.isArray(p.questions) ? p.questions.length : 0,
        }));

    return { stages, placements, totals };
}
