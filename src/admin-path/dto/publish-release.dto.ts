import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class PublishReleaseDto {
    @ApiPropertyOptional({
        description: 'What changed, for the release list',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    note?: string;
}
