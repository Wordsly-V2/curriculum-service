import {
    BadRequestException,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import type { PlacementSnapshot, TreeSnapshot } from '@/release/release.logic';
import { PlacementService } from './placement.service';

const USER = '11111111-1111-4111-8111-111111111111';
const RELEASE = { id: 'r1', version: 1 };

const tree = {
    snapshotVersion: 1,
    stages: [
        {
            id: 's1',
            units: [
                { id: 'u1', lessons: [] },
                { id: 'u2', lessons: [] },
                { id: 'u3', lessons: [] },
            ],
        },
    ],
} as unknown as TreeSnapshot;

/** Two questions on u1, two on u2; the right answer is always 1. */
const placement: PlacementSnapshot = {
    snapshotVersion: 1,
    id: 'pl1',
    slug: 'pl',
    title: 'Placement',
    questions: ['u1', 'u1', 'u2', 'u2'].map((unitId) => ({
        kind: 'choice' as const,
        prompt: 'p',
        options: ['a', 'b', 'c'],
        answer: 1,
        unitId,
    })),
};

type Result = {
    clientRequestId: string;
    releaseId: string;
    answers: unknown[];
};

function setup(
    options: { startUnitId?: string | null; placement?: boolean } = {},
) {
    const results = new Map<string, Result>();
    let enrollment: { startUnitId: string | null } | null =
        options.startUnitId === undefined
            ? null
            : { startUnitId: options.startUnitId };
    const tx = {
        placementResult: {
            create: jest.fn(({ data }: { data: Result }) => {
                results.set(data.clientRequestId, data);
                return Promise.resolve(data);
            }),
        },
        enrollment: {
            findUnique: jest.fn(() => Promise.resolve(enrollment)),
            upsert: jest.fn(
                ({ update }: { update: { startUnitId: string | null } }) => {
                    enrollment = { startUnitId: update.startUnitId };
                    return Promise.resolve(enrollment);
                },
            ),
        },
    };
    const prisma = {
        ...tx,
        placementResult: {
            ...tx.placementResult,
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
                        results.get(
                            where.userLoginId_clientRequestId.clientRequestId,
                        ) ?? null,
                    ),
            ),
        },
        $transaction: jest.fn((fn: (t: typeof tx) => Promise<unknown>) =>
            fn(tx),
        ),
    };
    const cache = { invalidateUser: jest.fn() };
    const me = () => ({ startUnitId: enrollment?.startUnitId ?? null });
    const progress = {
        context: jest.fn(() =>
            Promise.resolve({ release: RELEASE, tree, me: me() }),
        ),
        me: jest.fn(() => Promise.resolve(me())),
    };
    const published = {
        placement: jest.fn(() =>
            Promise.resolve(options.placement === false ? null : placement),
        ),
        tree: jest.fn(() => Promise.resolve(tree)),
    };
    const events = { publish: jest.fn() };
    const service = new PlacementService(
        prisma as never,
        cache as never,
        progress as never,
        published as never,
        events as never,
    );
    return { service, tx, cache, events };
}

describe('PlacementService', () => {
    it('serves the questions without answers, with their units', async () => {
        const view = await setup().service.view(USER);
        expect(view).toMatchObject({ placementId: 'pl1', releaseId: 'r1' });
        expect(view.questions.map((q) => q.unitId)).toEqual([
            'u1',
            'u1',
            'u2',
            'u2',
        ]);
        expect(JSON.stringify(view.questions)).not.toMatch(/answer/);
    });

    it('404s when the release has no placement test', async () => {
        await expect(
            setup({ placement: false }).service.view(USER),
        ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('enrolls at the placed unit and drops the learner cache', async () => {
        const { service, tx, cache, events } = setup();
        const result = await service.submit(USER, {
            clientRequestId: 'req-1',
            releaseId: 'r1',
            // u1 known, u2 missed, the rest not answered
            answers: [1, 1, 0, null],
        });
        expect(result).toMatchObject({
            replayed: false,
            placedUnitId: 'u2',
            skippedUnitIds: ['u1'],
            startUnitId: 'u2',
        });
        expect(tx.placementResult.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                placementTestId: 'pl1',
                placedUnitId: 'u2',
                answers: [1, 1, 0, null],
            }) as unknown,
        });
        expect(cache.invalidateUser).toHaveBeenCalledWith(USER);
        expect(events.publish).toHaveBeenCalledTimes(1);
    });

    it('never moves an enrolled learner back', async () => {
        const { service } = setup({ startUnitId: 'u3' });
        const result = await service.submit(USER, {
            clientRequestId: 'req-1',
            answers: [0, 0, 0, 0],
        });
        expect(result.placedUnitId).toBeNull();
        expect(result.startUnitId).toBe('u3');
    });

    it('returns the first grade for a resent request', async () => {
        const { service, tx, events } = setup();
        await service.submit(USER, {
            clientRequestId: 'req-1',
            answers: [1, 1, 1, 1],
        });
        const again = await service.submit(USER, {
            clientRequestId: 'req-1',
            answers: [0, 0, 0, 0],
        });
        expect(again).toMatchObject({ replayed: true, placedUnitId: 'u3' });
        expect(tx.placementResult.create).toHaveBeenCalledTimes(1);
        expect(events.publish).toHaveBeenCalledTimes(1);
    });

    it('refuses answers for another release or of the wrong shape', async () => {
        const { service } = setup();
        await expect(
            service.submit(USER, {
                clientRequestId: 'a',
                releaseId: 'r0',
                answers: [1, 1, 1, 1],
            }),
        ).rejects.toBeInstanceOf(ConflictException);
        await expect(
            service.submit(USER, { clientRequestId: 'b', answers: [1] }),
        ).rejects.toBeInstanceOf(BadRequestException);
        await expect(
            service.submit(USER, {
                clientRequestId: 'c',
                answers: [1, 1, 1, { x: 1 }],
            }),
        ).rejects.toBeInstanceOf(BadRequestException);
    });
});
