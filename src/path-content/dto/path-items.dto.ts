import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

/** Same cap as learning-service's id lists, which is the main caller. */
export const MAX_ITEM_IDS = 500;

export class ItemIdsDto {
    @ApiProperty({ type: [String], maxItems: MAX_ITEM_IDS })
    @IsArray()
    @ArrayMaxSize(MAX_ITEM_IDS)
    @IsUUID('all', { each: true })
    itemIds: string[];
}

export class ItemIdsResponseDto {
    @ApiProperty({
        type: [String],
        description: 'The ids that are items of the active release.',
    })
    itemIds: string[];
}
