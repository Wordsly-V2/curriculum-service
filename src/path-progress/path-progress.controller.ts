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
import {
    type CheckpointSubmitResult,
    type CheckpointView,
    CheckpointService,
} from './checkpoint.service';
import {
    CompleteLessonDto,
    SubmitCheckpointDto,
} from './dto/path-progress.dto';
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
    constructor(
        private readonly progress: PathProgressService,
        private readonly checkpoints: CheckpointService,
    ) {}

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

    @Get('units/:id/checkpoint')
    @ApiOperation({ summary: "A unit's checkpoint, without the answers" })
    @ApiResponse({ status: 403, description: 'Checkpoint is locked' })
    checkpoint(
        @CurrentUser() userLoginId: string,
        @Param('id', new ParseUUIDPipe()) unitId: string,
    ): Promise<CheckpointView> {
        return this.checkpoints.view(userLoginId, unitId);
    }

    @Post('units/:id/checkpoint/submit')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Grade a checkpoint attempt (idempotent per clientRequestId)',
    })
    @ApiResponse({ status: 409, description: 'A newer release is active' })
    submitCheckpoint(
        @CurrentUser() userLoginId: string,
        @Param('id', new ParseUUIDPipe()) unitId: string,
        @Body() body: SubmitCheckpointDto,
    ): Promise<CheckpointSubmitResult> {
        return this.checkpoints.submit(userLoginId, unitId, body);
    }
}
