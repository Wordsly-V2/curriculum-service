import { contentHash } from './content-hash';
import { contentId } from './content-id';
import type {
    CheckpointSeed,
    ContentCorpus,
    DialogueSeed,
    ItemSeed,
    LessonSeed,
    StageSeed,
    UnitFile,
} from './content.schema';

/**
 * The canonical seed shape of each content row: what `contentHash` is computed
 * over, whether the row came from a seed file (importer) or from the database
 * (release validation, admin edits via content-rows.ts). References are by
 * slug. A lesson's record includes its steps and item links, so they are
 * written and hashed together.
 */

export type UnitRecord = Omit<
    UnitFile,
    'items' | 'dialogues' | 'lessons' | 'checkpoint'
>;
export type ItemRecord = ItemSeed & { unit: string };
export type DialogueRecord = DialogueSeed & { unit: string };
/** `order` is the lesson's position in its unit, from 1. */
export type LessonRecord = LessonSeed & { unit: string; order: number };
export type CheckpointRecord = CheckpointSeed & { unit: string };

interface Seed<K extends string, R> {
    kind: K;
    slug: string;
    id: string;
    hash: string;
    record: R;
}

export type SeedRecord =
    | Seed<'stage', StageSeed>
    | Seed<'unit', UnitRecord>
    | Seed<'item', ItemRecord>
    | Seed<'dialogue', DialogueRecord>
    | Seed<'lesson', LessonRecord>
    | Seed<'checkpoint', CheckpointRecord>;

export type ContentTable = SeedRecord['kind'];

/** Parents before children, so foreign keys hold at every write. */
export const IMPORT_ORDER: readonly ContentTable[] = [
    'stage',
    'unit',
    'item',
    'dialogue',
    'lesson',
    'checkpoint',
];

/** A record with its id and hash, as the importer and the admin API write it. */
export function seed<K extends ContentTable, R extends { slug: string }>(
    kind: K,
    record: R,
): Seed<K, R> {
    return {
        kind,
        slug: record.slug,
        id: contentId(kind, record.slug),
        hash: contentHash(record),
        record,
    };
}

/** Every row the corpus describes, in IMPORT_ORDER. */
export function toSeedRecords(corpus: ContentCorpus): SeedRecord[] {
    const records: SeedRecord[] = corpus.stages.map((stage) =>
        seed('stage', stage),
    );

    for (const unit of corpus.units) {
        const {
            items,
            dialogues,
            lessons,
            checkpoint,
            ...unitRecord
        }: UnitFile = unit;
        const ref = { unit: unit.slug };

        records.push(seed('unit', unitRecord));
        records.push(...items.map((item) => seed('item', { ...item, ...ref })));
        records.push(
            ...dialogues.map((dialogue) =>
                seed('dialogue', { ...dialogue, ...ref }),
            ),
        );
        records.push(
            ...lessons.map((lesson, index) =>
                seed('lesson', { ...lesson, ...ref, order: index + 1 }),
            ),
        );
        if (checkpoint)
            records.push(seed('checkpoint', { ...checkpoint, ...ref }));
    }

    const rank = (kind: ContentTable) => IMPORT_ORDER.indexOf(kind);
    // Array.prototype.sort is stable: file order is kept within a kind.
    return records.sort((a, b) => rank(a.kind) - rank(b.kind));
}
