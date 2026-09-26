import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CacheService } from '@/cache/cache.service';
import { PublishedContentService } from '@/path-content/published-content.service';
import { PrismaService } from '@/prisma/prisma.service';
import type { CheckpointSnapshot } from '@/release/release.logic';
import {
    type CheckpointGrade,
    type CheckpointQuestion,
    type CheckpointResponse,
    gradeCheckpoint,
    isCheckpointResponse,
    learnerQuestions,
} from './checkpoint.logic';
import { PathProgressEvents } from './path-progress-events';
import { type PathMe, PathProgressService } from './path-progress.service';
import { type NodeState, findUnit } from './unit.logic';

export interface CheckpointView {
    unitId: string;
    checkpointId: string;
    /** Send it back on submit: grading refuses a checkpoint that changed since. */
    releaseId: string;
    passPercent: number;
    state: NodeState;
    questions: CheckpointQuestion[];
}

export type CheckpointSubmitResult = CheckpointGrade & {
    /** True when this clientRequestId was already graded. */
    replayed: boolean;
    me: PathMe;
};

export interface SubmitCheckpointInput {
    clientRequestId: string;
    releaseId?: string;
    answers: unknown[];
}

/**
 * A unit's checkpoint: questions without answers, graded on the server. Every
 * attempt is kept; a unit counts as passed once any attempt passed.
 */
@Injectable()
export class CheckpointService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
        private readonly progress: PathProgressService,
        private readonly published: PublishedContentService,
        private readonly events: PathProgressEvents,
    ) {}

    async view(userLoginId: string, unitId: string): Promise<CheckpointView> {
        const { release, checkpoint, state } = await this.open(
            userLoginId,
            unitId,
        );
        return {
            unitId,
            checkpointId: checkpoint.id,
            releaseId: release.id,
            passPercent: checkpoint.passPercent,
            state,
            questions: learnerQuestions(checkpoint.questions),
        };
    }

    /** Idempotent per `clientRequestId`: a resend returns the first grade. */
    async submit(
        userLoginId: string,
        unitId: string,
        input: SubmitCheckpointInput,
    ): Promise<CheckpointSubmitResult> {
        if (!input.answers.every(isCheckpointResponse)) {
            throw new BadRequestException(
                'Each answer is an option index, a text or a list of words',
            );
        }
        const answers = input.answers;

        const replay = await this.replay(userLoginId, unitId, input);
        if (replay) return replay;

        const { release, checkpoint } = await this.open(userLoginId, unitId);
        if (input.releaseId && input.releaseId !== release.id) {
            throw new ConflictException(
                'The checkpoint changed; load it again',
            );
        }
        if (answers.length !== checkpoint.questions.length) {
            throw new BadRequestException(
                `Expected ${checkpoint.questions.length} answers`,
            );
        }

        const grade = gradeCheckpoint(checkpoint, answers);
        try {
            await this.prisma.checkpointAttempt.create({
                data: {
                    userLoginId,
                    checkpointId: checkpoint.id,
                    releaseId: release.id,
                    clientRequestId: input.clientRequestId,
                    scorePercent: grade.scorePercent,
                    passed: grade.passed,
                    answers: answers as Prisma.InputJsonValue,
                },
            });
        } catch (err: unknown) {
            // The same request raced itself: answer like a resend.
            if (
                err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === 'P2002'
            ) {
                const raced = await this.replay(userLoginId, unitId, input);
                if (raced) return raced;
            }
            throw err;
        }

        if (grade.passed) await this.cache.invalidateUser(userLoginId);
        const { tree, me } = await this.progress.context(userLoginId);
        if (grade.passed) await this.events.publish(userLoginId, tree, me);
        return { ...grade, replayed: false, me };
    }

    /** The graded result of an attempt already recorded under this request id. */
    private async replay(
        userLoginId: string,
        unitId: string,
        input: SubmitCheckpointInput,
    ): Promise<CheckpointSubmitResult | null> {
        const attempt = await this.prisma.checkpointAttempt.findUnique({
            where: {
                userLoginId_clientRequestId: {
                    userLoginId,
                    clientRequestId: input.clientRequestId,
                },
            },
        });
        if (!attempt) return null;

        const { release, tree, me } = await this.progress.context(userLoginId);
        if (
            findUnit(tree, unitId)?.unit.checkpointId !== attempt.checkpointId
        ) {
            throw new ConflictException(
                'This clientRequestId was used for another checkpoint',
            );
        }
        const checkpoint = await this.published.checkpoint(
            attempt.releaseId ?? release.id,
            attempt.checkpointId,
        );
        if (!checkpoint) throw new NotFoundException('Checkpoint not found');

        const grade = gradeCheckpoint(
            checkpoint,
            attempt.answers as CheckpointResponse[],
        );
        return { ...grade, replayed: true, me };
    }

    /** 404 without a checkpoint in the release, 403 while it is locked. */
    private async open(
        userLoginId: string,
        unitId: string,
    ): Promise<{
        release: { id: string };
        checkpoint: CheckpointSnapshot;
        state: NodeState;
    }> {
        const { release, tree, me } = await this.progress.context(userLoginId);
        const checkpointId = findUnit(tree, unitId)?.unit.checkpointId;
        if (!checkpointId) throw new NotFoundException('Checkpoint not found');

        const state = me.progress.units.find((u) => u.unitId === unitId)!
            .checkpoint!.state;
        if (state === 'locked') {
            throw new ForbiddenException('This checkpoint is still locked');
        }

        const checkpoint = await this.published.checkpoint(
            release.id,
            checkpointId,
        );
        if (!checkpoint) throw new NotFoundException('Checkpoint not found');
        return { release, checkpoint, state };
    }
}
