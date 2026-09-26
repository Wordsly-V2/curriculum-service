import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    ArrayNotEmpty,
    IsArray,
    IsOptional,
    IsUUID,
    Matches,
} from 'class-validator';
import { MAX_LOOKUP_IDS } from '../admin-learners.logic';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export class PathStatsQueryDto {
    @ApiPropertyOptional({ description: 'Inclusive UTC day, YYYY-MM-DD' })
    @IsOptional()
    @Matches(ISO_DATE, { message: 'from must be YYYY-MM-DD' })
    from?: string;

    @ApiPropertyOptional({ description: 'Inclusive UTC day, YYYY-MM-DD' })
    @IsOptional()
    @Matches(ISO_DATE, { message: 'to must be YYYY-MM-DD' })
    to?: string;
}

export class ItemLookupDto {
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMaxSize(MAX_LOOKUP_IDS)
    @IsUUID('all', { each: true })
    ids!: string[];
}
