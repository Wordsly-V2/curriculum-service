import { Injectable } from '@nestjs/common';
import { CacheKind } from '@/cache/cache-ttl';
import { CacheService } from '@/cache/cache.service';
import { PrismaService } from '@/prisma/prisma.service';
import type {
    CheckpointSnapshot,
    ItemView,
    LessonSnapshot,
    PlacementSnapshot,
    TreeSnapshot,
} from '@/release/release.logic';

/**
 * Reads of one release's snapshot. Snapshots never change, so cache keys carry
 * the release id and are never invalidated; activating another release simply
 * reads other keys. Callers resolve the release with
 * `ReleaseService.activeRelease()`.
 */
@Injectable()
export class PublishedContentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cache: CacheService,
    ) {}

    async tree(releaseId: string): Promise<TreeSnapshot | null> {
        return this.cache.getOrSetGlobal(
            ['release', releaseId, 'tree'],
            async () => {
                const row = await this.prisma.publishedTree.findUnique({
                    where: { releaseId },
                });
                return (row?.tree as TreeSnapshot | undefined) ?? null;
            },
            CacheKind.Release,
            { shouldCache: (tree) => tree !== null },
        );
    }

    async lesson(
        releaseId: string,
        lessonId: string,
    ): Promise<LessonSnapshot | null> {
        return this.cache.getOrSetGlobal(
            ['release', releaseId, 'lesson', lessonId],
            async () => {
                const row = await this.prisma.publishedLesson.findUnique({
                    where: { releaseId_lessonId: { releaseId, lessonId } },
                });
                return (row?.payload as LessonSnapshot | undefined) ?? null;
            },
            CacheKind.Release,
            { shouldCache: (lesson) => lesson !== null },
        );
    }

    /** With its answers: grade with it, never send it to a client as is. */
    async checkpoint(
        releaseId: string,
        checkpointId: string,
    ): Promise<CheckpointSnapshot | null> {
        return this.cache.getOrSetGlobal(
            ['release', releaseId, 'checkpoint', checkpointId],
            async () => {
                const row = await this.prisma.publishedCheckpoint.findUnique({
                    where: {
                        releaseId_checkpointId: { releaseId, checkpointId },
                    },
                });
                return (row?.payload as CheckpointSnapshot | undefined) ?? null;
            },
            CacheKind.Release,
            { shouldCache: (checkpoint) => checkpoint !== null },
        );
    }

    /** The release's placement test, with its answers; null when it has none. */
    async placement(releaseId: string): Promise<PlacementSnapshot | null> {
        return this.cache.getOrSetGlobal(
            ['release', releaseId, 'placement'],
            async () => {
                const row = await this.prisma.publishedPlacement.findUnique({
                    where: { releaseId },
                });
                return (row?.payload as PlacementSnapshot | undefined) ?? null;
            },
            CacheKind.Release,
            { shouldCache: (placement) => placement !== null },
        );
    }

    /** The subset of `itemIds` in the release. Indexed lookup, not cached. */
    async filterPublished(
        releaseId: string,
        itemIds: string[],
    ): Promise<string[]> {
        if (itemIds.length === 0) return [];
        const rows = await this.prisma.publishedItem.findMany({
            where: { releaseId, itemId: { in: itemIds } },
            select: { itemId: true },
        });
        return rows.map((row) => row.itemId);
    }

    /** Views of the items in the release, in the order asked; unknown ids are left out. */
    async hydrate(releaseId: string, itemIds: string[]): Promise<ItemView[]> {
        if (itemIds.length === 0) return [];
        const rows = await this.prisma.publishedItem.findMany({
            where: { releaseId, itemId: { in: itemIds } },
            select: { itemId: true, payload: true },
        });
        const byId = new Map(
            rows.map((row) => [row.itemId, row.payload as unknown as ItemView]),
        );
        return [...new Set(itemIds)].flatMap((id) => {
            const item = byId.get(id);
            return item ? [item] : [];
        });
    }
}
