import { z } from 'zod';

/**
 * Shape of the seed files under `content/` (stages.json, units/<stage>/<unit>.json).
 * The admin API validates against the same schemas, so a record means the same
 * thing whichever way it was written. References between records are by slug;
 * ids are derived from slugs (content-id.ts) and never written in a seed.
 *
 * Cross-record rules (slugs exist, items introduced once and before they are
 * recycled, …) are in content-refs.logic.ts.
 */

export const SCHEMA_VERSION = 1;

export const slugSchema = z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case');

const text = z.string().trim().min(1);

// Enumerated values. The database stores them as TEXT (no database enums, by
// workspace rule), so these lists are the single source of truth.

export const CEFR_LEVELS = ['PRE_A1', 'A1', 'A2', 'B1', 'B2', 'C1'] as const;
export type CefrLevel = (typeof CEFR_LEVELS)[number];

/** Working-copy lifecycle. The importer never changes it; releases do. */
export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/**
 * LEXICAL a single word · PHRASE a fixed expression ("How are you?") ·
 * PATTERN a substitutable sentence frame ("I'd like {thing}, please.") ·
 * GRAMMAR a grammar point.
 */
export const ITEM_TYPES = ['LEXICAL', 'PHRASE', 'PATTERN', 'GRAMMAR'] as const;
export type ItemType = (typeof ITEM_TYPES)[number];

/** INTRODUCE: first taught here, gets an FSRS card · RECYCLE: taught earlier. */
export const LESSON_ITEM_ROLES = ['INTRODUCE', 'RECYCLE'] as const;
export type LessonItemRole = (typeof LESSON_ITEM_ROLES)[number];

/**
 * WARMUP review due Path items · INTRO present new items · EXPLAIN grammar or
 * pattern note in Vietnamese · PRACTICE existing practice modes ·
 * PATTERN_DRILL fill a pattern's slots · SPEAK listen and repeat ·
 * DIALOGUE listen or role-play · QUIZ end-of-lesson quiz.
 */
export const STEP_TYPES = [
    'WARMUP',
    'INTRO',
    'EXPLAIN',
    'PRACTICE',
    'PATTERN_DRILL',
    'SPEAK',
    'DIALOGUE',
    'QUIZ',
] as const;
export type StepType = (typeof STEP_TYPES)[number];

/** The frontend's concrete practice methods (`PracticeMode` minus 'mixed'). */
export const PRACTICE_MODES = [
    'flashcard',
    'context',
    'word-bank',
    'listening',
    'cloze',
    'sentence-build',
] as const;

// ─── Items ──────────────────────────────────────────────────────────────────

export const exampleSchema = z
    .strictObject({
        en: text,
        vi: text,
        /** Substring of `en` to emphasise (the item as it appears). */
        highlight: text.optional(),
    })
    .refine(
        (ex) =>
            !ex.highlight ||
            ex.en.toLowerCase().includes(ex.highlight.toLowerCase()),
        { message: 'highlight must appear in en', path: ['highlight'] },
    );

export const patternSchema = z
    .strictObject({
        /** Sentence frame with `{slot}` placeholders: "I'd like {thing}, please." */
        template: text,
        slots: z
            .array(
                z.strictObject({
                    name: z.string().regex(/^[a-z][a-zA-Z]*$/),
                    hintVi: text,
                    /** Sample fillers learners have already met. */
                    options: z.array(text).min(1),
                }),
            )
            .min(1),
    })
    .superRefine((pattern, ctx) => {
        const inTemplate = new Set(
            [...pattern.template.matchAll(/\{(\w+)\}/g)].map((m) => m[1]),
        );
        const declared = new Set(pattern.slots.map((s) => s.name));
        for (const name of inTemplate) {
            if (!declared.has(name)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `slot {${name}} is not declared`,
                    path: ['slots'],
                });
            }
        }
        for (const name of declared) {
            if (!inTemplate.has(name)) {
                ctx.addIssue({
                    code: 'custom',
                    message: `slot ${name} does not appear in the template`,
                    path: ['template'],
                });
            }
        }
    });

export const grammarSchema = z.strictObject({
    ruleVi: text,
    forms: z.array(z.strictObject({ label: text, example: text })).min(1),
    pitfallsVi: z.array(text),
});

export const itemSchema = z
    .strictObject({
        slug: slugSchema,
        type: z.enum(ITEM_TYPES),
        text,
        meaningVi: text,
        ipa: text.optional(),
        audioUrl: z.url().optional(),
        examples: z.array(exampleSchema),
        pattern: patternSchema.optional(),
        grammar: grammarSchema.optional(),
        collocations: z.array(text).optional(),
        /** A mistake Vietnamese learners typically make with this item. */
        noteVi: text.optional(),
    })
    .superRefine((item, ctx) => {
        const needs = {
            pattern: item.type === 'PATTERN',
            grammar: item.type === 'GRAMMAR',
        };
        for (const [field, required] of Object.entries(needs)) {
            const present = item[field as keyof typeof needs] !== undefined;
            if (required !== present) {
                ctx.addIssue({
                    code: 'custom',
                    message: required
                        ? `${item.type} items need ${field}`
                        : `only ${field.toUpperCase()} items take ${field}`,
                    path: [field],
                });
            }
        }
    });

// ─── Questions (quiz steps, checkpoints, placement) ────────────────────────

const questionBase = {
    /** Item the question tests, if any (for per-item scoring). */
    item: slugSchema.optional(),
    explanationVi: text.optional(),
};

export const questionSchema = z
    .discriminatedUnion('kind', [
        z.strictObject({
            kind: z.literal('choice'),
            prompt: text,
            /** Played with TTS before the options (listening question). */
            audioText: text.optional(),
            options: z.array(text).min(2).max(6),
            answer: z.int().min(0),
            ...questionBase,
        }),
        z.strictObject({
            kind: z.literal('gap'),
            /** English sentence with one `___` gap. */
            sentence: text.regex(/^[^_]*___[^_]*$/, 'needs exactly one ___'),
            hintVi: text.optional(),
            /** Accepted answers, compared case-insensitively. */
            answers: z.array(text).min(1),
            ...questionBase,
        }),
        z.strictObject({
            kind: z.literal('order'),
            /** Vietnamese meaning; the learner orders the words of `answer`. */
            vi: text,
            answer: text,
            ...questionBase,
        }),
    ])
    .superRefine((q, ctx) => {
        if (q.kind === 'choice' && q.answer >= q.options.length) {
            ctx.addIssue({
                code: 'custom',
                message: 'answer is not an option index',
                path: ['answer'],
            });
        }
    });

// ─── Steps ──────────────────────────────────────────────────────────────────

const version = z.literal(SCHEMA_VERSION);
const slugList = z.array(slugSchema).min(1);

/** Payload schema per step type. Every payload carries `schemaVersion`. */
export const stepPayloadSchemas = {
    WARMUP: z.strictObject({
        schemaVersion: version,
        maxItems: z.int().min(1).max(30),
    }),
    INTRO: z.strictObject({ schemaVersion: version, items: slugList }),
    EXPLAIN: z.strictObject({
        schemaVersion: version,
        titleVi: text,
        /** Markdown, in Vietnamese. */
        bodyVi: text,
        items: slugList.optional(),
        examples: z.array(exampleSchema).optional(),
    }),
    PRACTICE: z.strictObject({
        schemaVersion: version,
        modes: z.array(z.enum(PRACTICE_MODES)).min(1),
        items: slugList,
    }),
    PATTERN_DRILL: z.strictObject({
        schemaVersion: version,
        pattern: slugSchema,
        prompts: z
            .array(
                z.strictObject({
                    cueVi: text,
                    slots: z.record(z.string(), text),
                    answer: text,
                }),
            )
            .min(1),
    }),
    SPEAK: z.strictObject({
        schemaVersion: version,
        lines: z.array(z.strictObject({ en: text, vi: text })).min(1),
    }),
    DIALOGUE: z.strictObject({
        schemaVersion: version,
        dialogue: slugSchema,
        mode: z.enum(['listen', 'roleplay']),
    }),
    QUIZ: z.strictObject({
        schemaVersion: version,
        questions: z.array(questionSchema).min(1),
    }),
} as const satisfies Record<StepType, z.ZodType>;

export const stepSchema = z.discriminatedUnion('type', [
    z.strictObject({
        type: z.literal('WARMUP'),
        payload: stepPayloadSchemas.WARMUP,
    }),
    z.strictObject({
        type: z.literal('INTRO'),
        payload: stepPayloadSchemas.INTRO,
    }),
    z.strictObject({
        type: z.literal('EXPLAIN'),
        payload: stepPayloadSchemas.EXPLAIN,
    }),
    z.strictObject({
        type: z.literal('PRACTICE'),
        payload: stepPayloadSchemas.PRACTICE,
    }),
    z.strictObject({
        type: z.literal('PATTERN_DRILL'),
        payload: stepPayloadSchemas.PATTERN_DRILL,
    }),
    z.strictObject({
        type: z.literal('SPEAK'),
        payload: stepPayloadSchemas.SPEAK,
    }),
    z.strictObject({
        type: z.literal('DIALOGUE'),
        payload: stepPayloadSchemas.DIALOGUE,
    }),
    z.strictObject({
        type: z.literal('QUIZ'),
        payload: stepPayloadSchemas.QUIZ,
    }),
]);

// ─── Dialogues, lessons, checkpoints, units, stages ────────────────────────

export const dialogueSchema = z.strictObject({
    slug: slugSchema,
    title: text,
    situationVi: text,
    lines: z
        .array(
            z.strictObject({
                speaker: text,
                en: text,
                vi: text,
                /** The learner says this line in role-play. */
                learnerTurn: z.boolean().optional(),
            }),
        )
        .min(2),
});

export const lessonSchema = z.strictObject({
    slug: slugSchema,
    title: text,
    titleVi: text,
    estimatedMinutes: z.int().min(1).max(60),
    items: z.array(
        z.strictObject({
            item: slugSchema,
            role: z.enum(LESSON_ITEM_ROLES),
        }),
    ),
    steps: z.array(stepSchema).min(1),
});

export const checkpointSchema = z.strictObject({
    slug: slugSchema,
    passPercent: z.int().min(1).max(100),
    questions: z.array(questionSchema).min(1),
});

/** One file under `content/units/<stage>/`. Lesson order is array order. */
export const unitFileSchema = z.strictObject({
    slug: slugSchema,
    stage: slugSchema,
    /** Position within the stage, from 1. */
    order: z.int().min(1),
    title: text,
    titleVi: text,
    descriptionVi: text.optional(),
    canDo: z.array(text).min(1),
    items: z.array(itemSchema),
    dialogues: z.array(dialogueSchema),
    lessons: z.array(lessonSchema).min(1),
    checkpoint: checkpointSchema.optional(),
});

export const stageSchema = z.strictObject({
    slug: slugSchema,
    cefr: z.enum(CEFR_LEVELS),
    order: z.int().min(1),
    title: text,
    titleVi: text,
    descriptionVi: text.optional(),
});

/** `content/stages.json`. */
export const stagesFileSchema = z.array(stageSchema).min(1);

export type Question = z.infer<typeof questionSchema>;
export type StepSeed = z.infer<typeof stepSchema>;
export type ItemSeed = z.infer<typeof itemSchema>;
export type DialogueSeed = z.infer<typeof dialogueSchema>;
export type LessonSeed = z.infer<typeof lessonSchema>;
export type CheckpointSeed = z.infer<typeof checkpointSchema>;
export type UnitFile = z.infer<typeof unitFileSchema>;
export type StageSeed = z.infer<typeof stageSchema>;

/** Everything under `content/`, parsed. */
export interface ContentCorpus {
    stages: StageSeed[];
    units: UnitFile[];
}
