import { contentId, stepId } from '@/content/content-id';
import type {
    CefrLevel,
    ContentCorpus,
    DialogueSeed,
    ItemSeed,
    ItemType,
    LessonItemRole,
    Question,
    StepSeed,
    StepType,
    UnitFile,
} from '@/content/content.schema';

/**
 * Builds the immutable snapshot of a release from a validated corpus. Every
 * slug reference becomes an id (contentId), because clients key everything by
 * id: learning-service's FSRS cards, offline caches, progress.
 *
 * Bump SNAPSHOT_VERSION when a snapshot shape changes incompatibly; readers can
 * then tell old releases apart.
 */

export const SNAPSHOT_VERSION = 1;

export interface ItemView {
    id: string;
    slug: string;
    type: ItemType;
    text: string;
    meaningVi: string;
    ipa?: string;
    audioUrl?: string;
    examples: ItemSeed['examples'];
    pattern?: ItemSeed['pattern'];
    grammar?: ItemSeed['grammar'];
    collocations?: string[];
    noteVi?: string;
}

export type DialogueView = DialogueSeed & { id: string };

/** A question with its tested item as an id. */
export type QuestionView = Omit<Question, 'item'> & { itemId?: string };

/** Step payloads with references resolved: `items` → `itemIds`, etc. */
export type StepPayloadView =
    | {
          type: 'WARMUP';
          payload: Extract<StepSeed, { type: 'WARMUP' }>['payload'];
      }
    | {
          type: 'SPEAK';
          payload: Extract<StepSeed, { type: 'SPEAK' }>['payload'];
      }
    | {
          type: 'INTRO' | 'PRACTICE' | 'EXPLAIN';
          payload: Record<string, unknown> & { itemIds?: string[] };
      }
    | {
          type: 'PATTERN_DRILL';
          payload: Record<string, unknown> & { patternId: string };
      }
    | {
          type: 'DIALOGUE';
          payload: {
              schemaVersion: number;
              mode: 'listen' | 'roleplay';
              dialogue: DialogueView;
          };
      }
    | {
          type: 'QUIZ';
          payload: { schemaVersion: number; questions: QuestionView[] };
      };

export type StepView = StepPayloadView & { id: string; type: StepType };

export interface LessonSnapshot {
    snapshotVersion: number;
    id: string;
    slug: string;
    unitId: string;
    /** Position in the unit, from 1. */
    order: number;
    title: string;
    titleVi: string;
    estimatedMinutes: number;
    /** Items linked to the lesson, in link order. */
    items: (ItemView & { role: LessonItemRole })[];
    steps: StepView[];
}

export interface CheckpointSnapshot {
    snapshotVersion: number;
    id: string;
    slug: string;
    unitId: string;
    passPercent: number;
    questions: QuestionView[];
}

export interface TreeLesson {
    id: string;
    slug: string;
    order: number;
    title: string;
    titleVi: string;
    estimatedMinutes: number;
    newItemCount: number;
}

export interface TreeUnit {
    id: string;
    slug: string;
    order: number;
    title: string;
    titleVi: string;
    descriptionVi?: string;
    canDo: string[];
    lessons: TreeLesson[];
    checkpointId: string | null;
}

export interface TreeStage {
    id: string;
    slug: string;
    cefr: CefrLevel;
    order: number;
    title: string;
    titleVi: string;
    descriptionVi?: string;
    units: TreeUnit[];
}

/** The path map: stages → units → lesson summaries, in learning order. */
export interface TreeSnapshot {
    snapshotVersion: number;
    stages: TreeStage[];
}

export interface ReleaseSnapshot {
    tree: TreeSnapshot;
    lessons: { lessonId: string; unitId: string; payload: LessonSnapshot }[];
    checkpoints: {
        checkpointId: string;
        unitId: string;
        payload: CheckpointSnapshot;
    }[];
    /** Every item in the release, for filter-published and hydrate. */
    items: { itemId: string; payload: ItemView }[];
}

const itemId = (slug: string) => contentId('item', slug);

function itemView(item: ItemSeed): ItemView {
    return { id: itemId(item.slug), ...item };
}

function questionView({ item, ...rest }: Question): QuestionView {
    return item ? { ...rest, itemId: itemId(item) } : rest;
}

function stepView(
    lessonSlug: string,
    index: number,
    step: StepSeed,
    dialogues: Map<string, DialogueSeed>,
): StepView {
    const id = stepId(lessonSlug, index);
    switch (step.type) {
        case 'INTRO':
        case 'PRACTICE':
        case 'EXPLAIN': {
            const { items, ...rest } = step.payload;
            return {
                id,
                type: step.type,
                payload: items ? { ...rest, itemIds: items.map(itemId) } : rest,
            };
        }
        case 'PATTERN_DRILL': {
            const { pattern, ...rest } = step.payload;
            return {
                id,
                type: step.type,
                payload: { ...rest, patternId: itemId(pattern) },
            };
        }
        case 'DIALOGUE': {
            const { dialogue: slug, ...rest } = step.payload;
            // checkContentRefs guarantees the dialogue is in the lesson's unit.
            const dialogue = dialogues.get(slug)!;
            return {
                id,
                type: step.type,
                payload: {
                    ...rest,
                    dialogue: { id: contentId('dialogue', slug), ...dialogue },
                },
            };
        }
        case 'QUIZ':
            return {
                id,
                type: step.type,
                payload: {
                    ...step.payload,
                    questions: step.payload.questions.map(questionView),
                },
            };
        case 'WARMUP':
        case 'SPEAK':
            return { id, ...step };
    }
}

/** Snapshot of a corpus that passed validation (rowsToCorpus / loadContent). */
export function buildRelease(corpus: ContentCorpus): ReleaseSnapshot {
    const items = new Map<string, ItemSeed>();
    for (const unit of corpus.units) {
        for (const item of unit.items) items.set(item.slug, item);
    }

    const unitsByStage = new Map<string, UnitFile[]>();
    for (const unit of corpus.units) {
        unitsByStage.set(unit.stage, [
            ...(unitsByStage.get(unit.stage) ?? []),
            unit,
        ]);
    }

    const lessons: ReleaseSnapshot['lessons'] = [];
    const checkpoints: ReleaseSnapshot['checkpoints'] = [];

    const stages = [...corpus.stages]
        .sort((a, b) => a.order - b.order)
        .map((stage): TreeStage => {
            const units = [...(unitsByStage.get(stage.slug) ?? [])]
                .sort((a, b) => a.order - b.order)
                .map((unit): TreeUnit => {
                    const unitId = contentId('unit', unit.slug);
                    const dialogues = new Map(
                        unit.dialogues.map((d) => [d.slug, d]),
                    );

                    const treeLessons = unit.lessons.map((lesson, index) => {
                        const lessonId = contentId('lesson', lesson.slug);
                        const order = index + 1;
                        lessons.push({
                            lessonId,
                            unitId,
                            payload: {
                                snapshotVersion: SNAPSHOT_VERSION,
                                id: lessonId,
                                slug: lesson.slug,
                                unitId,
                                order,
                                title: lesson.title,
                                titleVi: lesson.titleVi,
                                estimatedMinutes: lesson.estimatedMinutes,
                                items: lesson.items.map((link) => ({
                                    ...itemView(items.get(link.item)!),
                                    role: link.role,
                                })),
                                steps: lesson.steps.map((step, i) =>
                                    stepView(lesson.slug, i, step, dialogues),
                                ),
                            },
                        });
                        return {
                            id: lessonId,
                            slug: lesson.slug,
                            order,
                            title: lesson.title,
                            titleVi: lesson.titleVi,
                            estimatedMinutes: lesson.estimatedMinutes,
                            newItemCount: lesson.items.filter(
                                (l) => l.role === 'INTRODUCE',
                            ).length,
                        };
                    });

                    let checkpointId: string | null = null;
                    if (unit.checkpoint) {
                        checkpointId = contentId(
                            'checkpoint',
                            unit.checkpoint.slug,
                        );
                        checkpoints.push({
                            checkpointId,
                            unitId,
                            payload: {
                                snapshotVersion: SNAPSHOT_VERSION,
                                id: checkpointId,
                                slug: unit.checkpoint.slug,
                                unitId,
                                passPercent: unit.checkpoint.passPercent,
                                questions:
                                    unit.checkpoint.questions.map(questionView),
                            },
                        });
                    }

                    return {
                        id: unitId,
                        slug: unit.slug,
                        order: unit.order,
                        title: unit.title,
                        titleVi: unit.titleVi,
                        descriptionVi: unit.descriptionVi,
                        canDo: unit.canDo,
                        lessons: treeLessons,
                        checkpointId,
                    };
                });

            return {
                id: contentId('stage', stage.slug),
                slug: stage.slug,
                cefr: stage.cefr,
                order: stage.order,
                title: stage.title,
                titleVi: stage.titleVi,
                descriptionVi: stage.descriptionVi,
                units,
            };
        });

    return {
        tree: { snapshotVersion: SNAPSHOT_VERSION, stages },
        lessons,
        checkpoints,
        items: [...items.values()].map((item) => ({
            itemId: itemId(item.slug),
            payload: itemView(item),
        })),
    };
}
