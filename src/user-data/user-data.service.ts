import { CacheService } from '@/cache/cache.service';
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';

/** Everything curriculum-service holds for one learner, as a whole. */
@Injectable()
export class UserDataService {
    private readonly logger = new Logger(UserDataService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
    ) {}

    /**
     * Delete a deleted account's Path data in one transaction: enrollment,
     * lesson completions, checkpoint attempts and placement results.
     * Idempotent. Content an admin authored keeps its `updatedBy`/`createdBy`
     * stamp (a bare id, no personal data). Unlike the admin Path reset this
     * publishes no `path_progress`: learning-service purges the same user.
     */
    async purgeUser(userLoginId: string): Promise<Record<string, number>> {
        const where = { userLoginId };
        const purged = await this.prisma.$transaction(async (tx) => ({
            enrollment: (await tx.enrollment.deleteMany({ where })).count,
            lessonCompletion: (await tx.lessonCompletion.deleteMany({ where }))
                .count,
            checkpointAttempt: (
                await tx.checkpointAttempt.deleteMany({ where })
            ).count,
            placementResult: (await tx.placementResult.deleteMany({ where }))
                .count,
        }));
        await this.cache.invalidateUser(userLoginId);
        this.logger.log(
            `user_purged ${JSON.stringify({ userLoginId, purged })}`,
        );
        return purged;
    }
}
