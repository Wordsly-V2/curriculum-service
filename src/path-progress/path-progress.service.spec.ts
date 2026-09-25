import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { TreeSnapshot } from '@/release/release.logic';
import { PathProgressService } from './path-progress.service';

const USER = '11111111-1111-4111-8111-111111111111';
const RELEASE = { id: 'r1', version: 1 };

const tree: TreeSnapshot = {
    snapshotVersion: 1,
    stages: [
        {
            id: 's1',
            slug: 's1',
            cefr: 'PRE_A1',
            order: 1,
            title: 's',
            titleVi: 's',
            units: [
                {
                    id: 'u1',
                    slug: 'u1',
                    order: 1,
                    title: 'u',
                    titleVi: 'u',
                    canDo: [],
                    checkpointId: null,
                    lessons: ['l1', 'l2'].map((id, i) => ({
                        id,
                        slug: id,
                        order: i + 1,
                        title: id,
                        titleVi: id,
                        estimatedMinutes: 10,
                        newItemCount: 3,
                    })),
                },
            ],
        },
    ],
};

function setup(
    state: {
        enrolled?: boolean;
        completed?: {
            lessonId: string;
            lastClientRequestId: string | null;
            bestScore: number | null;
        }[];
    } = {},
) {
    const completions = [...(state.completed ?? [])];
    const prisma = {
        enrollment: {
            findUnique: jest.fn(() =>
                Promise.resolve(
                    state.enrolled === false
                        ? null
                        : {
                              userLoginId: USER,
                              startUnitId: null,
                              enrolledAt: new Date(0),
                          },
                ),
            ),
            upsert: jest.fn(),
        },
        lessonCompletion: {
            findMany: jest.fn(() =>
                Promise.resolve(
                    completions.map((c) => ({ lessonId: c.lessonId })),
                ),
            ),
            findUnique: jest.fn(
                ({
                    where,
                }: {
                    where: { userLoginId_lessonId: { lessonId: string } };
                }) =>
                    Promise.resolve(
                        completions.find(
                            (c) =>
                                c.lessonId ===
                                where.userLoginId_lessonId.lessonId,
                        ) ?? null,
                    ),
            ),
            create: jest.fn(
                ({
                    data,
                }: {
                    data: {
                        lessonId: string;
                        lastClientRequestId: string;
                        bestScore: number | null;
                    };
                }) => {
                    completions.push({ ...data });
                },
            ),
            update: jest.fn(),
        },
        checkpointAttempt: { findMany: jest.fn(() => Promise.resolve([])) },
        placementResult: { findFirst: jest.fn(() => Promise.resolve(null)) },
    };
    // No Redis: always compute.
    const cache = {
        getOrSet: jest.fn(
            (_u: string, _k: string[], factory: () => Promise<unknown>) =>
                factory(),
        ),
        invalidateUser: jest.fn(),
    };
    const releases = { activeRelease: jest.fn(() => Promise.resolve(RELEASE)) };
    const published = {
        tree: jest.fn(() => Promise.resolve(tree)),
        lesson: jest.fn((_r: string, lessonId: string) =>
            Promise.resolve({
                id: lessonId,
            }),
        ),
    };
    const service = new PathProgressService(
        prisma as never,
        cache as never,
        releases as never,
        published as never,
    );
    return { service, prisma, cache, releases };
}

describe('PathProgressService', () => {
    it('404s when nothing is published', async () => {
        const { service, releases } = setup();
        releases.activeRelease.mockResolvedValue(null as never);
        await expect(service.me(USER)).rejects.toBeInstanceOf(
            NotFoundException,
        );
    });

    it('reports progress for an enrolled learner', async () => {
        const { service } = setup({
            completed: [
                { lessonId: 'l1', lastClientRequestId: 'a', bestScore: 80 },
            ],
        });
        const me = await service.me(USER);
        expect(me).toMatchObject({ enrolled: true, release: RELEASE });
        expect(me.progress.currentLessonId).toBe('l2');
    });

    it('404s for a lesson outside the release and 403s while locked', async () => {
        const { service } = setup();
        await expect(service.lesson(USER, 'nope')).rejects.toBeInstanceOf(
            NotFoundException,
        );
        await expect(service.lesson(USER, 'l2')).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        await expect(service.lesson(USER, 'l1')).resolves.toEqual({
            lesson: { id: 'l1' },
            state: 'available',
        });
    });

    it('locks everything before enrolment', async () => {
        const { service } = setup({ enrolled: false });
        await expect(service.lesson(USER, 'l1')).rejects.toBeInstanceOf(
            ForbiddenException,
        );
        await expect(service.unit(USER, 'u1')).rejects.toBeInstanceOf(
            ForbiddenException,
        );
    });

    it('records a first completion and unlocks the next lesson', async () => {
        const { service, prisma, cache } = setup();
        const result = await service.complete(USER, 'l1', {
            clientRequestId: 'req-1',
            scorePercent: 90,
        });
        expect(result.replayed).toBe(false);
        expect(prisma.lessonCompletion.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                userLoginId: USER,
                lessonId: 'l1',
                bestScore: 90,
                lastClientRequestId: 'req-1',
                releaseId: 'r1',
            }) as unknown,
        });
        expect(cache.invalidateUser).toHaveBeenCalledWith(USER);
        expect(result.me.progress.currentLessonId).toBe('l2');
    });

    it('treats a resent clientRequestId as a replay', async () => {
        const { service, prisma, cache } = setup({
            completed: [
                { lessonId: 'l1', lastClientRequestId: 'req-1', bestScore: 90 },
            ],
        });
        const result = await service.complete(USER, 'l1', {
            clientRequestId: 'req-1',
            scorePercent: 90,
        });
        expect(result.replayed).toBe(true);
        expect(prisma.lessonCompletion.update).not.toHaveBeenCalled();
        expect(cache.invalidateUser).not.toHaveBeenCalled();
    });

    it('counts a repeat and keeps the best score', async () => {
        const { service, prisma } = setup({
            completed: [
                { lessonId: 'l1', lastClientRequestId: 'req-1', bestScore: 90 },
            ],
        });
        await service.complete(USER, 'l1', {
            clientRequestId: 'req-2',
            scorePercent: 70,
        });
        expect(prisma.lessonCompletion.update).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    timesCompleted: { increment: 1 },
                    bestScore: 90,
                    lastClientRequestId: 'req-2',
                }) as unknown,
            }),
        );
    });

    it('falls back to an update when a concurrent first completion wins', async () => {
        const { service, prisma } = setup();
        prisma.lessonCompletion.create.mockImplementationOnce(() => {
            prisma.lessonCompletion.findUnique.mockResolvedValueOnce({
                lessonId: 'l1',
                lastClientRequestId: 'other',
                bestScore: null,
            } as never);
            throw new Prisma.PrismaClientKnownRequestError('unique', {
                code: 'P2002',
                clientVersion: 'test',
            });
        });
        await service.complete(USER, 'l1', { clientRequestId: 'req-1' });
        expect(prisma.lessonCompletion.update).toHaveBeenCalledTimes(1);
    });

    it('refuses to complete a locked lesson', async () => {
        const { service, prisma } = setup();
        await expect(
            service.complete(USER, 'l2', { clientRequestId: 'x' }),
        ).rejects.toBeInstanceOf(ForbiddenException);
        expect(prisma.lessonCompletion.create).not.toHaveBeenCalled();
    });
});
