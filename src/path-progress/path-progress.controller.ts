import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/auth/jwt/current-user.decorator';
import { CompleteLessonDto } from './dto/path-progress.dto';
import {
    type CompleteResult,
    type LessonView,
    type PathMe,
    PathProgressService,
    type UnitView,
} from './path-progress.service';

/** The caller's own progress on the path. Locked units and lessons are 403. */
@ApiTags('path')
@Controller('path')
export class PathProgressController {
    constructor(private readonly progress: PathProgressService) {}

    @Get('me')
    @ApiOperation({ summary: 'Enrolment and what is unlocked' })
    me(@CurrentUser() userLoginId: string): Promise<PathMe> {
        return this.progress.me(userLoginId);
    }

    @Post('enroll')
    @HttpCode(200)
    @ApiOperation({ summary: 'Start the path (idempotent)' })
    enroll(@CurrentUser() userLoginId: string): Promise<PathMe> {
        return this.progress.enroll(userLoginId);
    }

    @Get('units/:id')
    @ApiResponse({ status: 403, description: 'Unit is locked' })
    unit(
        @CurrentUser() userLoginId: string,
        @Param('id', new ParseUUIDPipe()) unitId: string,
    ): Promise<UnitView> {
        return this.progress.unit(userLoginId, unitId);
    }

    @Get('lessons/:id')
    @ApiOperation({ summary: 'A lesson as the player needs it' })
    @ApiResponse({ status: 403, description: 'Lesson is locked' })
    lesson(
        @CurrentUser() userLoginId: string,
        @Param('id', new ParseUUIDPipe()) lessonId: string,
    ): Promise<LessonView> {
        return this.progress.lesson(userLoginId, lessonId);
    }

    @Post('lessons/:id/complete')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Record a finished lesson (idempotent per clientRequestId)',
    })
    complete(
        @CurrentUser() userLoginId: string,
        @Param('id', new ParseUUIDPipe()) lessonId: string,
        @Body() body: CompleteLessonDto,
    ): Promise<CompleteResult> {
        return this.progress.complete(userLoginId, lessonId, body);
    }
}
