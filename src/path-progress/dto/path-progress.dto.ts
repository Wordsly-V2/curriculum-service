import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Max,
    Min,
} from 'class-validator';

export class CompleteLessonDto {
    @ApiProperty({
        description:
            'Client-generated id of this completion; resending it (offline retry) is a no-op.',
    })
    @IsString()
    @Length(1, 100)
    clientRequestId: string;

    @ApiPropertyOptional({ minimum: 0, maximum: 100 })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    scorePercent?: number;
}

export class SubmitCheckpointDto {
    @ApiProperty({
        description:
            'Client-generated id of this attempt; resending it returns the first grade.',
    })
    @IsString()
    @Length(1, 100)
    clientRequestId: string;

    @ApiPropertyOptional({
        description:
            'Release the questions came from (GET …/checkpoint); 409 if another release is active now.',
    })
    @IsOptional()
    @IsUUID()
    releaseId?: string;

    @ApiProperty({
        description:
            'One per question, in order: option index (choice), typed text (gap), words in order (order).',
        type: 'array',
        items: {},
    })
    @IsArray()
    @ArrayMaxSize(100)
    answers: unknown[];
}

export class SubmitPlacementDto {
    @ApiProperty({
        description:
            'Client-generated id of this attempt; resending it returns the first grade.',
    })
    @IsString()
    @Length(1, 100)
    clientRequestId: string;

    @ApiPropertyOptional({
        description:
            'Release the questions came from (GET /path/placement); 409 if another release is active now.',
    })
    @IsOptional()
    @IsUUID()
    releaseId?: string;

    @ApiProperty({
        description:
            'One per question, in order: option index, typed text, words in order, or null when not answered (the learner stopped).',
        type: 'array',
        items: {},
    })
    @IsArray()
    @ArrayMaxSize(300)
    answers: unknown[];
}
