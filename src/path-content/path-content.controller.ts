import {
    Body,
    Controller,
    Get,
    HttpCode,
    NotFoundException,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '@/auth/jwt/public.decorator';
import type { ItemView, TreeSnapshot } from '@/release/release.logic';
import { ReleaseService } from '@/release/release.service';
import { ItemIdsDto, ItemIdsResponseDto } from './dto/path-items.dto';
import { PublishedContentService } from './published-content.service';

/**
 * Learner-facing reads of the published path. Everything under `/path` is
 * routed here by the gateway. Content is the same for every learner; the
 * learner's own state is in path-progress/.
 */
@ApiTags('path')
@Controller('path')
export class PathContentController {
    constructor(
        private readonly releases: ReleaseService,
        private readonly published: PublishedContentService,
    ) {}

    /** Reachability probe through the gateway (`/path` is this service's prefix). */
    @Public()
    @Get('ping')
    ping(): { service: string; status: string } {
        return { service: 'curriculum', status: 'ok' };
    }

    @Get()
    @ApiOperation({ summary: 'The path map of the active release' })
    @ApiResponse({ status: 404, description: 'Nothing published yet' })
    async tree(): Promise<TreeSnapshot> {
        const release = await this.releases.activeRelease();
        const tree = release && (await this.published.tree(release.id));
        if (!tree) {
            throw new NotFoundException('Wordsly Path is not published yet');
        }
        return tree;
    }

    @Post('items/filter-published')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Keep only ids of items in the active release',
        description:
            'Called by learning-service (with the learner token) before it creates or updates a Path card.',
    })
    @ApiResponse({ status: 200, type: ItemIdsResponseDto })
    async filterPublished(
        @Body() body: ItemIdsDto,
    ): Promise<ItemIdsResponseDto> {
        const release = await this.releases.activeRelease();
        if (!release) return { itemIds: [] };
        return {
            itemIds: await this.published.filterPublished(
                release.id,
                body.itemIds,
            ),
        };
    }

    @Post('items/hydrate')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Item views for ids in the active release (e.g. Path review)',
    })
    async hydrate(@Body() body: ItemIdsDto): Promise<ItemView[]> {
        const release = await this.releases.activeRelease();
        if (!release) return [];
        return this.published.hydrate(release.id, body.itemIds);
    }
}
