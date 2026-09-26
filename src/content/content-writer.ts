import type { Prisma } from '@prisma/client';
import type { SeedRecord } from './content-records';
import {
    checkpointColumns,
    dialogueColumns,
    itemColumns,
    lessonChildren,
    lessonColumns,
    placementColumns,
    stageColumns,
    unitColumns,
} from './content-rows';
import type { ContentStatus } from './content.schema';

type Tx = Prisma.TransactionClient;

export interface WriteOptions {
    /** Create the row (else update it by id). */
    insert: boolean;
    /**
     * The importer stamps the seed's hash; an admin create leaves it null (no
     * seed behind the row) and an admin update leaves it untouched (undefined),
     * so the importer can still tell the edit from the seed.
     */
    seedHash: string | null | undefined;
    /** Admin's userLoginId; null for the importer. */
    updatedBy: string | null;
    /** Omitted keeps the row's status (the importer never changes it). */
    status?: ContentStatus;
}

/**
 * Writes one seed-shaped record to its row, shared by the importer and the
 * admin API so both produce the same columns and hashes. A lesson's steps and
 * item links are part of its record, so an update replaces them.
 */
export async function writeRecord(
    tx: Tx,
    seed: SeedRecord,
    { insert, seedHash, updatedBy, status }: WriteOptions,
): Promise<void> {
    const id = seed.id;
    const meta = {
        slug: seed.slug,
        contentHash: seed.hash,
        // undefined leaves the column as it is
        seedHash,
        updatedBy,
        status,
    };

    switch (seed.kind) {
        case 'stage': {
            const data = { ...meta, ...stageColumns(seed.record) };
            await (insert
                ? tx.stage.create({ data: { id, ...data } })
                : tx.stage.update({ where: { id }, data }));
            return;
        }
        case 'unit': {
            const data = { ...meta, ...unitColumns(seed.record) };
            await (insert
                ? tx.unit.create({ data: { id, ...data } })
                : tx.unit.update({ where: { id }, data }));
            return;
        }
        case 'item': {
            const data = { ...meta, ...itemColumns(seed.record) };
            await (insert
                ? tx.learnItem.create({ data: { id, ...data } })
                : tx.learnItem.update({ where: { id }, data }));
            return;
        }
        case 'dialogue': {
            const data = { ...meta, ...dialogueColumns(seed.record) };
            await (insert
                ? tx.dialogue.create({ data: { id, ...data } })
                : tx.dialogue.update({ where: { id }, data }));
            return;
        }
        case 'lesson': {
            // Steps and item links belong to the lesson's hash: replace them.
            if (!insert) {
                await tx.lessonStep.deleteMany({ where: { lessonId: id } });
                await tx.lessonItem.deleteMany({ where: { lessonId: id } });
            }
            const { steps, items } = lessonChildren(seed.record);
            const data = {
                ...meta,
                ...lessonColumns(seed.record),
                steps: { create: steps },
                items: { create: items },
            };
            await (insert
                ? tx.lesson.create({ data: { id, ...data } })
                : tx.lesson.update({ where: { id }, data }));
            return;
        }
        case 'checkpoint': {
            const data = { ...meta, ...checkpointColumns(seed.record) };
            await (insert
                ? tx.checkpoint.create({ data: { id, ...data } })
                : tx.checkpoint.update({ where: { id }, data }));
            return;
        }
        case 'placement': {
            const data = { ...meta, ...placementColumns(seed.record) };
            await (insert
                ? tx.placementTest.create({ data: { id, ...data } })
                : tx.placementTest.update({ where: { id }, data }));
            return;
        }
    }
}
