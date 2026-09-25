import { readdir, readFile } from 'node:fs/promises';
import { basename, dirname, join, relative } from 'node:path';
import type { ZodType } from 'zod';
import { checkContentRefs } from './content-refs.logic';
import {
    type ContentCorpus,
    type UnitFile,
    stagesFileSchema,
    unitFileSchema,
} from './content.schema';

/** Where the seed lives: `<repo>/content`, relative to the working directory. */
export const DEFAULT_CONTENT_DIR = join(process.cwd(), 'content');

export interface LoadedContent {
    corpus: ContentCorpus;
    /** Schema and reference problems, prefixed with the file or record. */
    errors: string[];
}

/**
 * Reads `stages.json` and every `units/<stage>/<unit-slug>.json` under `dir`,
 * validates each file with zod, then the corpus as a whole. A unit file's
 * folder must be its stage slug and its name its own slug.
 */
export async function loadContent(
    dir = DEFAULT_CONTENT_DIR,
): Promise<LoadedContent> {
    const errors: string[] = [];

    const stages =
        (await parseFile(
            join(dir, 'stages.json'),
            stagesFileSchema,
            dir,
            errors,
        )) ?? [];

    const unitsDir = join(dir, 'units');
    const unitPaths = (await readdir(unitsDir, { recursive: true }))
        .filter((path) => path.endsWith('.json'))
        .sort()
        .map((path) => join(unitsDir, path));

    const units: UnitFile[] = [];
    for (const path of unitPaths) {
        const unit = await parseFile(path, unitFileSchema, dir, errors);
        if (!unit) continue;
        const file = relative(dir, path);
        if (basename(path) !== `${unit.slug}.json`) {
            errors.push(`${file}: file name must be ${unit.slug}.json`);
        }
        if (basename(dirname(path)) !== unit.stage) {
            errors.push(`${file}: must be in units/${unit.stage}/`);
        }
        units.push(unit);
    }

    const corpus = { stages, units };
    // Reference checks on a partly invalid corpus only add noise.
    if (errors.length === 0) errors.push(...checkContentRefs(corpus));
    return { corpus, errors };
}

async function parseFile<T>(
    path: string,
    schema: ZodType<T>,
    root: string,
    errors: string[],
): Promise<T | undefined> {
    const file = relative(root, path);
    let json: unknown;
    try {
        json = JSON.parse(await readFile(path, 'utf8'));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${file}: ${message}`);
        return undefined;
    }

    const result = schema.safeParse(json);
    if (!result.success) {
        for (const issue of result.error.issues) {
            errors.push(`${file} ${issue.path.join('.')}: ${issue.message}`);
        }
        return undefined;
    }
    return result.data;
}
