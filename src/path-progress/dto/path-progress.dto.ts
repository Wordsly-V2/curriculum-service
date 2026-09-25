import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

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
