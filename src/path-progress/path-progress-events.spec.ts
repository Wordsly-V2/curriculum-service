import { PATH_PROGRESS_TOPIC } from '@/messaging/constants';
import type { TreeSnapshot } from '@/release/release.logic';
import { PathProgressEvents } from './path-progress-events';
import type { PathMe } from './path-progress.service';

const USER = '00000000-0000-4000-8000-000000000001';
const tree: TreeSnapshot = { snapshotVersion: 1, stages: [] };
const me = {
    progress: {
        units: [],
        currentLessonId: null,
        completedLessonCount: 3,
        totalLessonCount: 3,
    },
} as unknown as PathMe;

describe('PathProgressEvents', () => {
    it('sends the totals keyed by learner', async () => {
        const kafka = { send: jest.fn() };
        await new PathProgressEvents(kafka as never).publish(USER, tree, me);
        expect(kafka.send).toHaveBeenCalledWith(
            PATH_PROGRESS_TOPIC,
            {
                userLoginId: USER,
                lessonsCompleted: 3,
                unitsCompleted: 0,
                stagesCompleted: 0,
                occurredAt: expect.any(String) as unknown,
            },
            USER,
        );
    });

    it('logs a failed send instead of failing the write', async () => {
        const kafka = {
            send: jest.fn(() => Promise.reject(new Error('down'))),
        };
        await expect(
            new PathProgressEvents(kafka as never).publish(USER, tree, me),
        ).resolves.toBeUndefined();
    });

    it('sends zero totals after a reset', async () => {
        const kafka = { send: jest.fn() };
        await new PathProgressEvents(kafka as never).publishReset(USER);
        expect(kafka.send).toHaveBeenCalledWith(
            PATH_PROGRESS_TOPIC,
            expect.objectContaining({
                userLoginId: USER,
                lessonsCompleted: 0,
                unitsCompleted: 0,
                stagesCompleted: 0,
            }) as unknown,
            USER,
        );
    });
});
