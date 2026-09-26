import { Injectable } from '@nestjs/common';
import { rowsToCorpus } from '@/content/content-rows';
import { loadContent } from '@/content/content-loader';
import type { ContentTable } from '@/content/content-records';
import type {
    PlanAction,
    PlanReason,
} from '@/content-import/content-import.logic';
import { ContentImportService } from '@/content-import/content-import.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ReleaseService } from '@/release/release.service';
import { type AdminTree, buildAdminTree } from './admin-path.logic';

export interface ValidationResult {
    /** A publish would go through. */
    ok: boolean;
    errors: string[];
}

export interface SeedPlanResult {
    /** `content/` could be read and validated; if not, see `errors`. */
    available: boolean;
    errors: string[];
    summary: Record<PlanAction, number> | null;
    /** Every record the importer would touch or refuses to (skips left out). */
    changes: {
        kind: ContentTable;
        slug: string;
        action: PlanAction;
        reason: PlanReason;
    }[];
}

const NODE = {
    id: true,
    slug: true,
    status: true,
    contentHash: true,
    seedHash: true,
    updatedAt: true,
} as const;

/** Read side of the admin API: the working copy as admins see it. */
@Injectable()
export class AdminPathService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly releases: ReleaseService,
        private readonly importer: ContentImportService,
    ) {}

    /** The whole working copy, archived rows included. */
    async overview(): Promise<AdminTree> {
        const [
            stages,
            units,
            lessons,
            items,
            dialogues,
            checkpoints,
            placements,
        ] = await Promise.all([
            this.prisma.stage.findMany({
                select: { ...NODE, order: true, title: true, cefr: true },
            }),
            this.prisma.unit.findMany({
                select: {
                    ...NODE,
                    stageId: true,
                    order: true,
                    title: true,
                },
            }),
            this.prisma.lesson.findMany({
                select: { ...NODE, unitId: true, order: true, title: true },
            }),
            this.prisma.learnItem.findMany({
                select: { ...NODE, unitId: true, type: true, text: true },
            }),
            this.prisma.dialogue.findMany({
                select: { ...NODE, unitId: true, title: true },
            }),
            this.prisma.checkpoint.findMany({
                select: { ...NODE, unitId: true },
            }),
            this.prisma.placementTest.findMany({
                select: { ...NODE, title: true, questions: true },
            }),
        ]);
        return buildAdminTree({
            stages,
            units,
            lessons,
            items,
            dialogues,
            checkpoints,
            placements,
        });
    }

    /** Runs the publish-time checks on the working copy without publishing. */
    async validate(): Promise<ValidationResult> {
        const { errors } = rowsToCorpus(await this.releases.workingCopy());
        return { ok: errors.length === 0, errors };
    }

    /**
     * What `content:import` would do now: new seed records, seed changes it
     * would apply, and conflicts where both the seed and an admin changed a row.
     */
    async seedPlan(): Promise<SeedPlanResult> {
        let loaded: Awaited<ReturnType<typeof loadContent>>;
        try {
            loaded = await loadContent();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : String(error);
            return {
                available: false,
                errors: [message],
                summary: null,
                changes: [],
            };
        }
        if (loaded.errors.length > 0) {
            return {
                available: false,
                errors: loaded.errors,
                summary: null,
                changes: [],
            };
        }
        const { plan, summary } = await this.importer.run(loaded.corpus, {
            dryRun: true,
        });
        return {
            available: true,
            errors: [],
            summary,
            changes: plan
                .filter((entry) => entry.action !== 'skip')
                .map((entry) => ({
                    kind: entry.seed.kind,
                    slug: entry.seed.slug,
                    action: entry.action,
                    reason: entry.reason,
                })),
        };
    }
}
