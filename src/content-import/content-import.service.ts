import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { writeRecord } from '@/content/content-writer';
import type { ContentCorpus } from '@/content/content.schema';
import { PrismaService } from '@/prisma/prisma.service';
import { toSeedRecords } from '@/content/content-records';
import {
    type ExistingRow,
    type PlanAction,
    type PlanEntry,
    planImport,
    summarizePlan,
} from './content-import.logic';

type Tx = Prisma.TransactionClient;

export interface ImportOptions {
    /** Slugs (or `kind:slug`) whose admin edits the seed overwrites. */
    force?: ReadonlySet<string>;
    /** Plan only; write nothing. */
    dryRun?: boolean;
}

export interface ImportResult {
    plan: PlanEntry[];
    summary: Record<PlanAction, number>;
}

/**
 * Writes the seed corpus into the working copy. New rows start as DRAFT and an
 * update never changes a row's status: publishing is a release (P1-2), not an
 * import. Reading the hashes and writing happen in one transaction, so a
 * concurrent admin edit cannot slip between plan and write.
 */
@Injectable()
export class ContentImportService {
    private readonly logger = new Logger(ContentImportService.name);

    constructor(private readonly prisma: PrismaService) {}

    async run(
        corpus: ContentCorpus,
        options: ImportOptions = {},
    ): Promise<ImportResult> {
        const seeds = toSeedRecords(corpus);

        return this.prisma.$transaction(
            async (tx) => {
                const plan = planImport(
                    seeds,
                    await this.existingRows(tx),
                    options.force,
                );
                if (!options.dryRun) {
                    for (const entry of plan) {
                        if (entry.action === 'insert') {
                            await writeRecord(tx, entry.seed, {
                                insert: true,
                                seedHash: entry.seed.hash,
                                updatedBy: null,
                            });
                        } else if (entry.action === 'update') {
                            await writeRecord(tx, entry.seed, {
                                insert: false,
                                seedHash: entry.seed.hash,
                                updatedBy: null,
                            });
                        }
                    }
                }
                const summary = summarizePlan(plan);
                this.logger.log(
                    `Content import${options.dryRun ? ' (dry run)' : ''}: ` +
                        Object.entries(summary)
                            .map(([action, count]) => `${action} ${count}`)
                            .join(', '),
                );
                return { plan, summary };
            },
            { timeout: 120_000 },
        );
    }

    private async existingRows(tx: Tx): Promise<ExistingRow[]> {
        const select = { slug: true, contentHash: true, seedHash: true };
        const [
            stages,
            units,
            items,
            dialogues,
            lessons,
            checkpoints,
            placements,
        ] = await Promise.all([
            tx.stage.findMany({ select }),
            tx.unit.findMany({ select }),
            tx.learnItem.findMany({ select }),
            tx.dialogue.findMany({ select }),
            tx.lesson.findMany({ select }),
            tx.checkpoint.findMany({ select }),
            tx.placementTest.findMany({ select }),
        ]);
        const tag = <K extends ExistingRow['kind']>(
            kind: K,
            rows: Omit<ExistingRow, 'kind'>[],
        ) => rows.map((row) => ({ kind, ...row }));

        return [
            ...tag('stage', stages),
            ...tag('unit', units),
            ...tag('item', items),
            ...tag('dialogue', dialogues),
            ...tag('lesson', lessons),
            ...tag('checkpoint', checkpoints),
            ...tag('placement', placements),
        ];
    }
}
