import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheService } from '@/cache/cache.service';
import { PublishedContentService } from '@/path-content/published-content.service';
import { PrismaService } from '@/prisma/prisma.service';
import type { PlacementSnapshot, TreeSnapshot } from '@/release/release.logic';
import { isCheckpointResponse } from './checkpoint.logic';
import { type PathMe, PathProgressService } from './path-progress.service';
import {
    type PlacementGrade,
    type PlacementLearnerQuestion,
    type PlacementResponse,
    gradePlacement,
    laterStart,
    placementLearnerQuestions,
} from './placement.logic';
import { unitsInOrder } from './unit.logic';

export interface PlacementView {
    placementId: string;
    /** Send it back on submit: grading refuses a test that changed since. */
    releaseId: string;
    title: string;
    questions: PlacementLearnerQuestion[];
}

export type PlacementSubmitResult = PlacementGrade & {
    /** The learner's start unit now (a retake never moves it back). */
    startUnitId: string | null;
    /** True when this clientRequestId was already graded. */
    replayed: boolean;
    me: PathMe;
};

export interface SubmitPlacementInput {
    clientRequestId: string;
    releaseId?: string;
    answers: unknown[];
}

const unitIds = (tree: TreeSnapshot) => unitsInOrder(tree).map((u) => u.id);

/**
 * The placement test: questions without answers, graded on the server
 * (placement.logic.ts). Submitting enrolls the learner if needed and moves
 * their start unit forward to where the test placed them. Every attempt is
 * kept; any learner may take it, before or after enrolling.
 */
@Injectable()
export class PlacementService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly progress: PathProgressService,
        private readonly published: PublishedContentService,
    ) {}

    async view(userLoginId: string): Promise<PlacementView> {
        const { release, placement } = await this.open(userLoginId);
        return {
            placementId: placement.id,
            releaseId: release.id,
            title: placement.title,
            questions: placementLearnerQuestions(placement.questions),
        };
    }

    /** Idempotent per `clientRequestId`: a resend returns the first grade. */
    async submit(
        userLoginId: string,
        input: SubmitPlacementInput,
    ): Promise<PlacementSubmitResult> {
        if (
            !input.answers.every((a) => a === null || isCheckpointResponse(a))
        ) {
            throw new BadRequestException(
                'Each answer is an option index, a text, a list of words or null',
            );
        }
        const answers = input.answers as PlacementResponse[];

        const replay = await this.replay(userLoginId, input.clientRequestId);
        if (replay) return replay;

        const { release, tree, placement } = await this.open(userLoginId);
        if (input.releaseId && input.releaseId !== release.id) {
            throw new ConflictException(
                'The placement test changed; load it again',
            );
        }
        if (answers.length !== placement.questions.length) {
            throw new BadRequestException(
                `Expected ${placement.questions.length} answers`,
            );
        }

        const order = unitIds(tree);
        const grade = gradePlacement(placement.questions, answers, order);
        try {
            await this.prisma.$transaction(async (tx) => {
                await tx.placementResult.create({
                    data: {
                        userLoginId,
                        placementTestId: placement.id,
                        releaseId: release.id,
                        clientRequestId: input.clientRequestId,
                        scorePercent: grade.scorePercent,
                        placedUnitId: grade.placedUnitId,
                        skippedUnitIds: grade.skippedUnitIds,
                        answers: answers as Prisma.InputJsonValue,
                    },
                });
                const enrollment = await tx.enrollment.findUnique({
                    where: { userLoginId },
                });
                const startUnitId = laterStart(
                    order,
                    enrollment?.startUnitId ?? null,
                    grade.placedUnitId,
                );
                await tx.enrollment.upsert({
                    where: { userLoginId },
                    create: { userLoginId, startUnitId },
                    update: { startUnitId },
                });
            });
        } catch (err: unknown) {
            // The same request raced itself: answer like a resend.
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002'
            ) {
                const raced = await this.replay(
                    userLoginId,
                    input.clientRequestId,
                );
                if (raced) return raced;
            }
            throw err;
        }

        await this.cache.invalidateUser(userLoginId);
        const me = await this.progress.me(userLoginId);
        return { ...grade, startUnitId: me.startUnitId, replayed: false, me };
    }

    /** The grade of an attempt already recorded under this request id. */
    private async replay(
        userLoginId: string,
        clientRequestId: string,
    ): Promise<PlacementSubmitResult | null> {
        const result = await this.prisma.placementResult.findUnique({
            where: {
                userLoginId_clientRequestId: { userLoginId, clientRequestId },
            },
        });
        if (!result) return null;

        const { release, tree, me } = await this.progress.context(userLoginId);
        const releaseId = result.releaseId ?? release.id;
        const [placement, gradedTree] = await Promise.all([
            this.published.placement(releaseId),
            this.published.tree(releaseId),
        ]);
        if (!placement) throw new NotFoundException('Placement test not found');

        const grade = gradePlacement(
            placement.questions,
            result.answers as PlacementResponse[],
            unitIds(gradedTree ?? tree),
        );
        return { ...grade, startUnitId: me.startUnitId, replayed: true, me };
    }

    /** 404 when the active release has no placement test. */
    private async open(userLoginId: string): Promise<{
        release: { id: string };
        tree: TreeSnapshot;
        placement: PlacementSnapshot;
    }> {
        const { release, tree } = await this.progress.context(userLoginId);
        const placement = await this.published.placement(release.id);
        if (!placement) {
            throw new NotFoundException('There is no placement test yet');
        }
        return { release, tree, placement };
    }
}
