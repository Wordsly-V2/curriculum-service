import { z } from 'zod';
import { seed, type SeedRecord } from '@/content/content-records';
import {
    checkpointSchema,
    dialogueSchema,
    itemSchema,
    lessonSchema,
    unitFileSchema,
} from '@/content/content.schema';

/**
 * Admin input → seed record. The body is the record in seed shape (children
 * name their unit by slug, a lesson carries its `order`), validated with the
 * seed's own zod schemas, so an admin write hashes exactly like the importer
 * would hash the same content.
 */

export const ADMIN_KINDS = [
    'unit',
    'item',
    'dialogue',
    'lesson',
    'checkpoint',
] as const;
export type AdminKind = (typeof ADMIN_KINDS)[number];

const unitRecordSchema = unitFileSchema.omit({
    items: true,
    dialogues: true,
    lessons: true,
    checkpoint: true,
});
const slug = z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case');
const unitRef = z.object({ unit: slug });
const lessonRef = z.object({ unit: slug, order: z.int().min(1) });

export type ParsedRecord =
    | { ok: true; seed: SeedRecord }
    | { ok: false; errors: string[] };

function issues(error: z.ZodError, prefix = ''): string[] {
    return error.issues.map(
        (i) =>
            `${[prefix, ...i.path.map(String)].filter(Boolean).join('.') || '(body)'}: ${i.message}`,
    );
}

/** Validates a child record: its reference fields apart from the seed schema. */
function parseChild<R extends { slug: string }, E extends object>(
    body: Record<string, unknown>,
    refSchema: z.ZodType<E>,
    refKeys: (keyof E & string)[],
    schema: z.ZodType<R>,
): { ok: true; record: R & E } | { ok: false; errors: string[] } {
    const ref = refSchema.safeParse(body);
    const rest = Object.fromEntries(
        Object.entries(body).filter(
            ([k]) => !(refKeys as string[]).includes(k),
        ),
    );
    const own = schema.safeParse(rest);
    const errors = [
        ...(ref.success ? [] : issues(ref.error)),
        ...(own.success ? [] : issues(own.error)),
    ];
    if (!ref.success || !own.success) return { ok: false, errors };
    return { ok: true, record: { ...own.data, ...ref.data } };
}

export function parseAdminRecord(kind: AdminKind, body: unknown): ParsedRecord {
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
        return { ok: false, errors: ['(body): expected an object'] };
    }
    const input = body as Record<string, unknown>;
    switch (kind) {
        case 'unit': {
            const parsed = unitRecordSchema.safeParse(input);
            return parsed.success
                ? { ok: true, seed: seed('unit', parsed.data) }
                : { ok: false, errors: issues(parsed.error) };
        }
        case 'item': {
            const parsed = parseChild(input, unitRef, ['unit'], itemSchema);
            return parsed.ok
                ? { ok: true, seed: seed('item', parsed.record) }
                : parsed;
        }
        case 'dialogue': {
            const parsed = parseChild(input, unitRef, ['unit'], dialogueSchema);
            return parsed.ok
                ? { ok: true, seed: seed('dialogue', parsed.record) }
                : parsed;
        }
        case 'lesson': {
            const parsed = parseChild(
                input,
                lessonRef,
                ['unit', 'order'],
                lessonSchema,
            );
            return parsed.ok
                ? { ok: true, seed: seed('lesson', parsed.record) }
                : parsed;
        }
        case 'checkpoint': {
            const parsed = parseChild(
                input,
                unitRef,
                ['unit'],
                checkpointSchema,
            );
            return parsed.ok
                ? { ok: true, seed: seed('checkpoint', parsed.record) }
                : parsed;
        }
    }
}
