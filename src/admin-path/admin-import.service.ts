import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { type SeedRecord, toSeedRecords } from '@/content/content-records';
import { rowsToCorpus } from '@/content/content-rows';
import { writeRecord } from '@/content/content-writer';
import { unitFileSchema } from '@/content/content.schema';
import { PrismaService } from '@/prisma/prisma.service';
import { ReleaseService } from '@/release/release.service';
import { AdminContentService } from './admin-content.service';
import {
    type AdminImportAction,
    type AdminImportEntry,
    type AdminImportReason,
    conflictMessage,
    type ImportTarget,
    planAdminImport,
    summarizeAdminImport,
} from './admin-import.logic';
import type { ValidationResult } from './admin-path.service';

type Tx = Prisma.TransactionClient;

export interface AdminImportResult {
    /** True when nothing was written (a dry run, or a refused apply). */
    dryRun: boolean;
    unit: string;
    summary: Record<AdminImportAction, number>;
    /** Every record of the file, in write order, with the record to review. */
    changes: {
        kind: SeedRecord['kind'];
        slug: string;
        action: AdminImportAction;
        reason: AdminImportReason;
        record: Record<string, unknown>;
    }[];
    /** What blocks applying: conflicts and references that don't resolve. */
    errors: string[];
    /** The working copy's publish checks with the file applied. */
    validation: ValidationResult;
}

/** Thrown inside the transaction to roll a dry run back. */
class DryRunRollback extends Error {
    constructor(readonly result: AdminImportResult) {
        super('dry run');
    }
}

/**
 * `POST /admin/path/import`: one unit file in seed shape (the format of
 * `content/units/<stage>/<unit>.json`) written as admin edits. Written rows
 * become DRAFT; a new row has no seed (`seedHash` null) and an updated one
 * keeps its `seedHash`, like a PUT, so the seed importer still tells them
 * apart. A dry run does the same writes in a transaction and rolls it back, so
 * the review shows the real reference errors and validation.
 */
@Injectable()
export class AdminImportService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly content: AdminContentService,
        private readonly releases: ReleaseService,
    ) {}

    async importUnit(
        body: unknown,
        { dryRun, adminId }: { dryRun: boolean; adminId: string },
    ): Promise<AdminImportResult> {
        const parsed = unitFileSchema.safeParse(body);
        if (!parsed.success) {
            throw new BadRequestException({
                message: 'Not a unit file',
                errors: parsed.error.issues.map(
                    (i) => `${i.path.join('.') || '(file)'}: ${i.message}`,
                ),
            });
        }
        const seeds = toSeedRecords({ stages: [], units: [parsed.data] });

        try {
            return await this.prisma.$transaction(
                async (tx) => {
                    const plan = planAdminImport(
                        seeds,
                        await this.targets(tx, seeds),
                    );
                    const errors = plan
                        .filter((e) => e.action === 'conflict')
                        .map(conflictMessage);
                    for (const entry of plan) {
                        if (
                            entry.action !== 'insert' &&
                            entry.action !== 'update'
                        )
                            continue;
                        const problem = await this.referenceProblem(tx, entry);
                        if (problem) {
                            errors.push(...problem);
                            continue;
                        }
                        await writeRecord(tx, entry.seed, {
                            insert: entry.action === 'insert',
                            seedHash:
                                entry.action === 'insert' ? null : undefined,
                            updatedBy: adminId,
                            status: 'DRAFT',
                        });
                    }
                    const result: AdminImportResult = {
                        dryRun: dryRun || errors.length > 0,
                        unit: parsed.data.slug,
                        summary: summarizeAdminImport(plan),
                        changes: plan.map((e) => ({
                            kind: e.seed.kind,
                            slug: e.seed.slug,
                            action: e.action,
                            reason: e.reason,
                            record: e.seed.record as Record<string, unknown>,
                        })),
                        errors,
                        validation: this.validation(
                            await this.releases.workingCopy(tx),
                        ),
                    };
                    // All or nothing: a refused apply writes nothing either.
                    if (result.dryRun) throw new DryRunRollback(result);
                    return result;
                },
                { timeout: 60_000 },
            );
        } catch (error) {
            if (error instanceof DryRunRollback) return error.result;
            throw error;
        }
    }

    private validation(
        rows: Awaited<ReturnType<ReleaseService['workingCopy']>>,
    ): ValidationResult {
        const { errors } = rowsToCorpus(rows);
        return { ok: errors.length === 0, errors };
    }

    /** The record's local reference problems, as messages (none: null). */
    private async referenceProblem(
        tx: Tx,
        entry: AdminImportEntry,
    ): Promise<string[] | null> {
        try {
            await this.content.checkReferences(tx, entry.seed);
            return null;
        } catch (error) {
            if (!(error instanceof HttpException)) throw error;
            const response = error.getResponse() as
                | string
                | { message?: string; errors?: string[] };
            const where = `${entry.seed.kind} ${entry.seed.slug}`;
            if (typeof response === 'string') return [`${where}: ${response}`];
            if (response.errors?.length)
                return response.errors.map(
                    (e) => `${where}: ${e} is missing or archived`,
                );
            return [`${where}: ${response.message ?? error.message}`];
        }
    }

    /** The rows the file's slugs already name, with the unit they belong to. */
    private async targets(
        tx: Tx,
        seeds: readonly SeedRecord[],
    ): Promise<ImportTarget[]> {
        const slugs = (kind: SeedRecord['kind']) => ({
            slug: {
                in: seeds.filter((s) => s.kind === kind).map((s) => s.slug),
            },
        });
        const meta = {
            slug: true,
            status: true,
            contentHash: true,
            seedHash: true,
        } as const;
        const child = { ...meta, unitId: true } as const;
        const [units, items, dialogues, lessons, checkpoints] =
            await Promise.all([
                tx.unit.findMany({ where: slugs('unit'), select: meta }),
                tx.learnItem.findMany({ where: slugs('item'), select: child }),
                tx.dialogue.findMany({
                    where: slugs('dialogue'),
                    select: child,
                }),
                tx.lesson.findMany({ where: slugs('lesson'), select: child }),
                tx.checkpoint.findMany({
                    where: slugs('checkpoint'),
                    select: child,
                }),
            ]);
        const unitIds = [
            ...new Set(
                [...items, ...dialogues, ...lessons, ...checkpoints]
                    .map((r) => r.unitId)
                    .filter((id): id is string => !!id),
            ),
        ];
        const unitSlug = new Map(
            (
                await tx.unit.findMany({
                    where: { id: { in: unitIds } },
                    select: { id: true, slug: true },
                })
            ).map((u) => [u.id, u.slug]),
        );
        const tag = (
            kind: SeedRecord['kind'],
            rows: (Omit<ImportTarget, 'kind' | 'unit'> & {
                unitId?: string | null;
            })[],
        ): ImportTarget[] =>
            rows.map(({ unitId, ...row }) => ({
                kind,
                ...row,
                unit: unitId ? (unitSlug.get(unitId) ?? null) : null,
            }));
        return [
            ...tag('unit', units),
            ...tag('item', items),
            ...tag('dialogue', dialogues),
            ...tag('lesson', lessons),
            ...tag('checkpoint', checkpoints),
        ];
    }
}
