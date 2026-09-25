import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { contentId, stepId } from '@/content/content-id';
import type { ContentCorpus } from '@/content/content.schema';
import { PrismaService } from '@/prisma/prisma.service';
import {
    type ExistingRow,
    type PlanAction,
    type PlanEntry,
    type SeedRecord,
    planImport,
    summarizePlan,
    toSeedRecords,
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
                            await this.write(tx, entry.seed, true);
                        } else if (entry.action === 'update') {
                            await this.write(tx, entry.seed, false);
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
        const [stages, units, items, dialogues, lessons, checkpoints] =
            await Promise.all([
                tx.stage.findMany({ select }),
                tx.unit.findMany({ select }),
                tx.learnItem.findMany({ select }),
                tx.dialogue.findMany({ select }),
                tx.lesson.findMany({ select }),
                tx.checkpoint.findMany({ select }),
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
        ];
    }

    private async write(
        tx: Tx,
        seed: SeedRecord,
        insert: boolean,
    ): Promise<void> {
        const id = seed.id;
        const meta = {
            slug: seed.slug,
            contentHash: seed.hash,
            seedHash: seed.hash,
            updatedBy: null,
        };

        switch (seed.kind) {
            case 'stage': {
                const r = seed.record;
                const data = {
                    ...meta,
                    cefr: r.cefr,
                    order: r.order,
                    title: r.title,
                    titleVi: r.titleVi,
                    descriptionVi: r.descriptionVi ?? null,
                };
                await (insert
                    ? tx.stage.create({ data: { id, ...data } })
                    : tx.stage.update({ where: { id }, data }));
                return;
            }
            case 'unit': {
                const r = seed.record;
                const data = {
                    ...meta,
                    stageId: contentId('stage', r.stage),
                    order: r.order,
                    title: r.title,
                    titleVi: r.titleVi,
                    descriptionVi: r.descriptionVi ?? null,
                    canDo: r.canDo,
                };
                await (insert
                    ? tx.unit.create({ data: { id, ...data } })
                    : tx.unit.update({ where: { id }, data }));
                return;
            }
            case 'item': {
                const r = seed.record;
                const data = {
                    ...meta,
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
                await (insert
                    ? tx.learnItem.create({ data: { id, ...data } })
                    : tx.learnItem.update({ where: { id }, data }));
                return;
            }
            case 'dialogue': {
                const r = seed.record;
                const data = {
                    ...meta,
                    unitId: contentId('unit', r.unit),
                    title: r.title,
                    situationVi: r.situationVi,
                    lines: json(r.lines),
                };
                await (insert
                    ? tx.dialogue.create({ data: { id, ...data } })
                    : tx.dialogue.update({ where: { id }, data }));
                return;
            }
            case 'lesson': {
                const r = seed.record;
                // Steps and item links belong to the lesson's hash: replace them.
                if (!insert) {
                    await tx.lessonStep.deleteMany({ where: { lessonId: id } });
                    await tx.lessonItem.deleteMany({ where: { lessonId: id } });
                }
                const data = {
                    ...meta,
                    unitId: contentId('unit', r.unit),
                    order: r.order,
                    title: r.title,
                    titleVi: r.titleVi,
                    estimatedMinutes: r.estimatedMinutes,
                    steps: {
                        create: r.steps.map((step, order) => ({
                            id: stepId(r.slug, order),
                            order,
                            type: step.type,
                            payload: json(step.payload),
                        })),
                    },
                    items: {
                        create: r.items.map((link, order) => ({
                            itemId: contentId('item', link.item),
                            role: link.role,
                            order,
                        })),
                    },
                };
                await (insert
                    ? tx.lesson.create({ data: { id, ...data } })
                    : tx.lesson.update({ where: { id }, data }));
                return;
            }
            case 'checkpoint': {
                const r = seed.record;
                const data = {
                    ...meta,
                    unitId: contentId('unit', r.unit),
                    passPercent: r.passPercent,
                    questions: json(r.questions),
                };
                await (insert
                    ? tx.checkpoint.create({ data: { id, ...data } })
                    : tx.checkpoint.update({ where: { id }, data }));
                return;
            }
        }
    }
}

function json(value: unknown): Prisma.InputJsonValue {
    return value as Prisma.InputJsonValue;
}
