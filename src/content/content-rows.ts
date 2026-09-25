import type {
    Checkpoint,
    Dialogue,
    LearnItem,
    Lesson,
    LessonItem,
    LessonStep,
    Stage,
    Unit,
} from '@prisma/client';
import { Prisma } from '@prisma/client';
import { contentId, stepId } from './content-id';
import type {
    CheckpointRecord,
    DialogueRecord,
    ItemRecord,
    LessonRecord,
    UnitRecord,
} from './content-records';
import { checkContentRefs } from './content-refs.logic';
import {
    type ContentCorpus,
    type StageSeed,
    type UnitFile,
    stageSchema,
    unitFileSchema,
} from './content.schema';

/**
 * The two directions between a seed record (content-records.ts) and a row:
 * - `*Columns`: record → the row's content columns (the importer, admin writes)
 * - `rowsToCorpus`: rows → seed-shaped corpus, validated like a seed (release
 *   publish, admin hashing)
 *
 * They must stay inverse: seed → rows → seed gives the same hashes
 * (content-rows.spec.ts), or admin edits and re-imports would see phantom
 * changes. Optional fields are null in a row and absent in a record.
 */

function json(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}

export function stageColumns(r: StageSeed) {
    return {
        cefr: r.cefr,
        order: r.order,
        title: r.title,
        titleVi: r.titleVi,
        descriptionVi: r.descriptionVi ?? null,
    };
}

export function unitColumns(r: UnitRecord) {
    return {
        stageId: contentId('stage', r.stage),
        order: r.order,
        title: r.title,
        titleVi: r.titleVi,
        descriptionVi: r.descriptionVi ?? null,
        canDo: r.canDo,
    };
}

export function itemColumns(r: ItemRecord) {
    return {
        unitId: contentId('unit', r.unit),
        type: r.type,
        text: r.text,
        meaningVi: r.meaningVi,
        ipa: r.ipa ?? null,
        audioUrl: r.audioUrl ?? null,
        examples: json(r.examples),
        pattern: r.pattern ? json(r.pattern) : Prisma.DbNull,
        grammar: r.grammar ? json(r.grammar) : Prisma.DbNull,
        collocations: r.collocations ?? [],
        noteVi: r.noteVi ?? null,
    };
}

export function dialogueColumns(r: DialogueRecord) {
    return {
        unitId: contentId('unit', r.unit),
        title: r.title,
        situationVi: r.situationVi,
        lines: json(r.lines),
    };
}

export function lessonColumns(r: LessonRecord) {
    return {
        unitId: contentId('unit', r.unit),
        order: r.order,
        title: r.title,
        titleVi: r.titleVi,
        estimatedMinutes: r.estimatedMinutes,
    };
}

/** A lesson's steps and item links, written together with the lesson. */
export function lessonChildren(r: LessonRecord) {
    return {
        steps: r.steps.map((step, order) => ({
            id: stepId(r.slug, order),
            order,
            type: step.type,
            payload: json(step.payload),
        })),
        items: r.items.map((link, order) => ({
            itemId: contentId('item', link.item),
            role: link.role,
            order,
        })),
    };
}

export function checkpointColumns(r: CheckpointRecord) {
    return {
        unitId: contentId('unit', r.unit),
        passPercent: r.passPercent,
        questions: json(r.questions),
    };
}

// ─── Rows → corpus ──────────────────────────────────────────────────────────

export interface WorkingCopy {
    stages: Stage[];
    units: Unit[];
    items: LearnItem[];
    dialogues: Dialogue[];
    lessons: (Lesson & { steps: LessonStep[]; items: LessonItem[] })[];
    checkpoints: Checkpoint[];
}

export interface CorpusFromRows {
    corpus: ContentCorpus;
    /** Rows that do not fit together or fail the seed schema. */
    errors: string[];
}

/** Drops null/undefined members, so optional columns become absent keys. */
function present<T extends Record<string, unknown>>(record: T): T {
    return Object.fromEntries(
        Object.entries(record).filter(([, v]) => v !== null && v !== undefined),
    ) as T;
}

const byOrder = (a: { order: number }, b: { order: number }) =>
    a.order - b.order;

// ─── One row → its seed shape (unvalidated; zod runs on the whole unit) ────
// Used by rowsToCorpus and by the admin API's reads, so both describe a row
// the same way. Children leave out `unit`; the caller adds it.

export function itemRowToSeed(item: LearnItem): Record<string, unknown> {
    return present({
        slug: item.slug,
        type: item.type,
        text: item.text,
        meaningVi: item.meaningVi,
        ipa: item.ipa,
        audioUrl: item.audioUrl,
        examples: item.examples,
        pattern: item.pattern,
        grammar: item.grammar,
        collocations:
            item.collocations.length > 0 ? item.collocations : undefined,
        noteVi: item.noteVi,
    });
}

export function dialogueRowToSeed(d: Dialogue): Record<string, unknown> {
    return {
        slug: d.slug,
        title: d.title,
        situationVi: d.situationVi,
        lines: d.lines,
    };
}

/**
 * Item links are written back as slugs; a link to an item missing from
 * `itemSlug` (archived or deleted) keeps its id and is reported.
 */
export function lessonRowToSeed(
    lesson: Lesson & { steps: LessonStep[]; items: LessonItem[] },
    itemSlug: ReadonlyMap<string, string>,
    onMissingItem: (itemId: string) => void = () => {},
): Record<string, unknown> {
    return {
        slug: lesson.slug,
        title: lesson.title,
        titleVi: lesson.titleVi,
        estimatedMinutes: lesson.estimatedMinutes,
        items: [...lesson.items].sort(byOrder).map((link) => {
            const item = itemSlug.get(link.itemId);
            if (!item) onMissingItem(link.itemId);
            return { item: item ?? link.itemId, role: link.role };
        }),
        steps: [...lesson.steps].sort(byOrder).map((step) => ({
            type: step.type,
            payload: step.payload,
        })),
    };
}

export function checkpointRowToSeed(c: Checkpoint): Record<string, unknown> {
    return {
        slug: c.slug,
        passPercent: c.passPercent,
        questions: c.questions,
    };
}

/** A unit's own fields (UnitRecord), without its children. */
export function unitRowToRecord(
    row: Unit,
    stageSlug: string,
): Record<string, unknown> {
    return present({
        slug: row.slug,
        stage: stageSlug,
        order: row.order,
        title: row.title,
        titleVi: row.titleVi,
        descriptionVi: row.descriptionVi,
        canDo: row.canDo,
    });
}
const bySlug = (a: { slug: string }, b: { slug: string }) =>
    a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;

/**
 * Rebuilds the seed-shaped corpus from rows (typically every non-archived row)
 * and validates it exactly as a seed would be: zod per stage and unit, then
 * `checkContentRefs`.
 */
export function rowsToCorpus(rows: WorkingCopy): CorpusFromRows {
    const errors: string[] = [];
    const stageSlug = new Map(rows.stages.map((s) => [s.id, s.slug]));
    const itemSlug = new Map(rows.items.map((i) => [i.id, i.slug]));
    const unitIds = new Set(rows.units.map((u) => u.id));

    const inUnit = <T extends { unitId: string | null; slug: string }>(
        kind: string,
        list: T[],
    ) => {
        const map = new Map<string, T[]>();
        for (const row of [...list].sort(bySlug)) {
            if (!row.unitId || !unitIds.has(row.unitId)) {
                errors.push(`${kind} ${row.slug}: not in any unit`);
                continue;
            }
            map.set(row.unitId, [...(map.get(row.unitId) ?? []), row]);
        }
        return map;
    };
    const itemsByUnit = inUnit('item', rows.items);
    const dialoguesByUnit = inUnit('dialogue', rows.dialogues);
    const lessonsByUnit = inUnit('lesson', rows.lessons);
    const checkpointByUnit = new Map(
        rows.checkpoints.map((c) => [c.unitId, c]),
    );

    const stages: StageSeed[] = [];
    for (const row of [...rows.stages].sort(byOrder)) {
        const parsed = stageSchema.safeParse(
            present({
                slug: row.slug,
                cefr: row.cefr,
                order: row.order,
                title: row.title,
                titleVi: row.titleVi,
                descriptionVi: row.descriptionVi,
            }),
        );
        if (parsed.success) stages.push(parsed.data);
        else pushIssues(errors, `stage ${row.slug}`, parsed.error.issues);
    }

    const units: UnitFile[] = [];
    for (const row of rows.units) {
        const stage = stageSlug.get(row.stageId);
        if (!stage) {
            errors.push(`unit ${row.slug}: its stage is missing`);
            continue;
        }
        const checkpoint = checkpointByUnit.get(row.id);
        const unit = present({
            slug: row.slug,
            stage,
            order: row.order,
            title: row.title,
            titleVi: row.titleVi,
            descriptionVi: row.descriptionVi,
            canDo: row.canDo,
            items: (itemsByUnit.get(row.id) ?? []).map(itemRowToSeed),
            dialogues: (dialoguesByUnit.get(row.id) ?? []).map(
                dialogueRowToSeed,
            ),
            lessons: (lessonsByUnit.get(row.id) ?? [])
                .sort(byOrder)
                .map((lesson) =>
                    lessonRowToSeed(lesson, itemSlug, (itemId) =>
                        errors.push(
                            `lesson ${lesson.slug}: links item ${itemId}, which is archived or missing`,
                        ),
                    ),
                ),
            checkpoint: checkpoint && checkpointRowToSeed(checkpoint),
        });

        const parsed = unitFileSchema.safeParse(unit);
        if (parsed.success) units.push(parsed.data);
        else pushIssues(errors, `unit ${row.slug}`, parsed.error.issues);
    }

    const corpus = { stages, units };
    if (errors.length === 0) errors.push(...checkContentRefs(corpus));
    return { corpus, errors };
}

function pushIssues(
    errors: string[],
    where: string,
    issues: { path: PropertyKey[]; message: string }[],
): void {
    for (const issue of issues) {
        errors.push(`${where} ${issue.path.join('.')}: ${issue.message}`);
    }
}
