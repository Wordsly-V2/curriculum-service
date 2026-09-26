import { Injectable, Logger } from '@nestjs/common';
import { PATH_PROGRESS_TOPIC } from '@/messaging/constants';
import { KafkaProducerService } from '@/messaging/kafka-producer.service';
import type { TreeSnapshot } from '@/release/release.logic';
import type { PathMe } from './path-progress.service';
import { type PathTotals, pathTotals } from './unit.logic';

/**
 * `path_progress` payload. Totals, not deltas: learning-service unlocks
 * achievements from whatever the latest message says, so a lost or repeated
 * message cannot miscount, and the next one catches up.
 */
export interface PathProgressEvent extends PathTotals {
    userLoginId: string;
    /** ISO instant; learning-service keeps the newest totals it has seen. */
    occurredAt: string;
}

@Injectable()
export class PathProgressEvents {
    private readonly logger = new Logger(PathProgressEvents.name);

    constructor(private readonly kafka: KafkaProducerService) {}

    /**
     * After the write is stored. A failed send is logged, not thrown: the
     * learner's progress is saved, and the next event carries the totals.
     */
    publish(userLoginId: string, tree: TreeSnapshot, me: PathMe) {
        return this.send(userLoginId, pathTotals(tree, me.progress));
    }

    /**
     * After an admin reset: the report's totals go back to zero. Achievements
     * already unlocked stay, since learning-service never revokes them.
     */
    publishReset(userLoginId: string) {
        return this.send(userLoginId, {
            lessonsCompleted: 0,
            unitsCompleted: 0,
            stagesCompleted: 0,
        });
    }

    private async send(userLoginId: string, totals: PathTotals): Promise<void> {
        const event: PathProgressEvent = {
            userLoginId,
            ...totals,
            occurredAt: new Date().toISOString(),
        };
        try {
            await this.kafka.send(PATH_PROGRESS_TOPIC, event, userLoginId);
        } catch (error) {
            this.logger.error(
                `Could not send ${PATH_PROGRESS_TOPIC} for ${userLoginId}: ${String(error)}`,
            );
        }
    }
}
