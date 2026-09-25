import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CheckpointSnapshot, TreeSnapshot } from '@/release/release.logic';
import { CheckpointService } from './checkpoint.service';
import type { NodeState } from './unit.logic';

const USER = '11111111-1111-4111-8111-111111111111';
const RELEASE = { id: 'r1', version: 1 };

const tree = {
    snapshotVersion: 1,
    stages: [
        {
            id: 's1',
            units: [
                { id: 'u1', checkpointId: 'cp1', lessons: [] },
                { id: 'u2', checkpointId: null, lessons: [] },
            ],
        },
    ],
} as unknown as TreeSnapshot;

const checkpoint: CheckpointSnapshot = {
    snapshotVersion: 1,
    id: 'cp1',
    slug: 'cp1',
    unitId: 'u1',
    passPercent: 50,
    questions: [
        { kind: 'choice', prompt: 'p', options: ['a', 'b'], answer: 1 },
        { kind: 'gap', sentence: 'I ___ ok.', answers: ['am'] },
    ],
};

type Attempt = {
    checkpointId: string;
    releaseId: string;
    answers: unknown[];
};

function setup(state: NodeState = 'available') {
    const attempts = new Map<string, Attempt>();
    const prisma = {
        checkpointAttempt: {
            findUnique: jest.fn(
                ({
                    where,
                }: {
                    where: {
                        userLoginId_clientRequestId: {
                            clientRequestId: string;
                        };
                    };
                }) =>
                    Promise.resolve(
                        attempts.get(
                            where.userLoginId_clientRequestId.clientRequestId,
                        ) ?? null,
                    ),
            ),
            create: jest.fn(
                ({ data }: { data: Attempt & { clientRequestId: string } }) => {
                    attempts.set(data.clientRequestId, data);
                    return Promise.resolve(data);
                },
            ),
        },
    };
    const cache = { invalidateUser: jest.fn() };
    const me = {
        progress: {
            units: [
                {
                    unitId: 'u1',
                    checkpoint: { checkpointId: 'cp1', state },
                },
                { unitId: 'u2', checkpoint: null },
            ],
        },
    };
    const progress = {
        context: jest.fn(() => Promise.resolve({ release: RELEASE, tree, me })),
    };
    const published = {
        checkpoint: jest.fn(() => Promise.resolve(checkpoint)),
    };
    const service = new CheckpointService(
        prisma as never,
        cache as never,
        progress as never,
        published as never,
    );
    return { service, prisma, cache, attempts };
}

describe('CheckpointService', () => {
    it('serves the questions without answers', async () => {
        const { service } = setup();
        const view = await service.view(USER, 'u1');
        expect(view).toMatchObject({
            unitId: 'u1',
            checkpointId: 'cp1',
            releaseId: 'r1',
            passPercent: 50,
            state: 'available',
        });
        expect(JSON.stringify(view.questions)).not.toMatch(/answer/);
    });

    it('404s without a checkpoint and 403s while locked', async () => {
        await expect(setup().service.view(USER, 'u2')).rejects.toBeInstanceOf(
            NotFoundException,
        );
        await expect(
            setup('locked').service.view(USER, 'u1'),
        ).rejects.toBeInstanceOf(ForbiddenException);
        await expect(
            setup('locked').service.submit(USER, 'u1', {
                clientRequestId: 'x',
                answers: [1, 'am'],
            }),
        ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('records a pass and drops the learner cache', async () => {
        const { service, prisma, cache } = setup();
        const result = await service.submit(USER, 'u1', {
            clientRequestId: 'req-1',
            releaseId: 'r1',
            answers: [1, 'nope'],
        });
        expect(result).toMatchObject({
            replayed: false,
            scorePercent: 50,
            passed: true,
        });
        expect(prisma.checkpointAttempt.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                checkpointId: 'cp1',
                releaseId: 'r1',
                passed: true,
                answers: [1, 'nope'],
            }) as unknown,
        });
        expect(cache.invalidateUser).toHaveBeenCalledWith(USER);
    });

    it('keeps the cache on a fail', async () => {
        const { service, cache } = setup();
        const result = await service.submit(USER, 'u1', {
            clientRequestId: 'req-1',
            answers: [0, 'nope'],
        });
        expect(result.passed).toBe(false);
        expect(result.results).toEqual([
            { correct: false },
            { correct: false },
        ]);
        expect(cache.invalidateUser).not.toHaveBeenCalled();
    });

    it('returns the first grade for a resent request', async () => {
        const { service, prisma } = setup();
        await service.submit(USER, 'u1', {
            clientRequestId: 'req-1',
            answers: [1, 'am'],
        });
        const again = await service.submit(USER, 'u1', {
            clientRequestId: 'req-1',
            answers: [0, 'x'],
        });
        expect(again).toMatchObject({ replayed: true, scorePercent: 100 });
        expect(prisma.checkpointAttempt.create).toHaveBeenCalledTimes(1);
    });

    it('answers a racing duplicate like a resend', async () => {
        const { service, prisma, attempts } = setup();
        prisma.checkpointAttempt.create.mockImplementationOnce(({ data }) => {
            attempts.set(data.clientRequestId, data);
            throw new Prisma.PrismaClientKnownRequestError('unique', {
                code: 'P2002',
                clientVersion: 'test',
            });
        });
        const result = await service.submit(USER, 'u1', {
            clientRequestId: 'req-1',
            answers: [1, 'am'],
        });
        expect(result.replayed).toBe(true);
    });

    it('refuses answers for another release or of the wrong shape', async () => {
        const { service } = setup();
        await expect(
            service.submit(USER, 'u1', {
                clientRequestId: 'a',
                releaseId: 'r0',
                answers: [1, 'am'],
            }),
        ).rejects.toBeInstanceOf(ConflictException);
        await expect(
            service.submit(USER, 'u1', { clientRequestId: 'b', answers: [1] }),
        ).rejects.toBeInstanceOf(BadRequestException);
        await expect(
            service.submit(USER, 'u1', {
                clientRequestId: 'c',
                answers: [1, { x: 1 }],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
