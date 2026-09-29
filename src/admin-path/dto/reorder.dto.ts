import { ApiProperty } from '@nestjs/swagger';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsIn,
    IsString,
} from 'class-validator';

export const REORDER_KINDS = ['unit', 'lesson'] as const;
export type ReorderKind = (typeof REORDER_KINDS)[number];

export class ReorderDto {
    @ApiProperty({
        enum: REORDER_KINDS,
        description: "What moves: a stage's units or a unit's lessons",
    })
    @IsIn(REORDER_KINDS)
    kind!: ReorderKind;

    @ApiProperty({ description: 'The stage (units) or unit (lessons) slug' })
    @IsString()
    parent!: string;

    @ApiProperty({
        type: [String],
        description: 'Every live child of the parent, in the new order',
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    @IsString({ each: true })
    slugs!: string[];
}
