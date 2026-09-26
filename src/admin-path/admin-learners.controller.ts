import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/jwt/current-user.decorator';
import { Roles } from '@/auth/jwt/roles.decorator';
import {
    AdminLearnersService,
    type ItemLookup,
    type LearnerPath,
    type PathStats,
} from './admin-learners.service';
import { ItemLookupDto, PathStatsQueryDto } from './dto/admin-learners.dto';

/**
 * Learners' side of Wordsly Path for admins, next to the authoring routes under
 * `/admin/path`. `:id` is a learner's `UserLoginId`; UserScopeGuard lets an
 * admin name it because the class requires `admin`.
 */
@ApiTags('admin-path')
@Roles('admin')
@Controller('admin/path')
export class AdminLearnersController {
    constructor(private readonly learners: AdminLearnersService) {}

    @Get('stats')
    @ApiOperation({
        summary:
            'Enrollments, completions, stages, lesson funnel, checkpoints, placement',
    })
    stats(@Query() query: PathStatsQueryDto): Promise<PathStats> {
        return this.learners.stats(query.from, query.to);
    }

    @Post('items/lookup')
    @HttpCode(200)
    @ApiOperation({ summary: 'Text and unit of items by id (archived too)' })
    lookup(@Body() body: ItemLookupDto): Promise<ItemLookup[]> {
        return this.learners.lookupItems(body.ids);
    }

    @Get('users/:id')
    @ApiOperation({ summary: "One learner's enrollment and Path progress" })
    learner(@Param('id', ParseUUIDPipe) id: string): Promise<LearnerPath> {
        return this.learners.learner(id);
    }

    @Post('users/:id/reset')
    @HttpCode(200)
    @ApiOperation({
        summary:
            'Un-enroll a learner and clear their Path progress (not their cards)',
    })
    reset(
        @CurrentUser() actorId: string,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{ affected: Record<string, number> }> {
        return this.learners.reset(actorId, id);
    }
}
