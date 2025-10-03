import { IsOptional, IsArray, IsIn, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class FindRecipesDto {
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value.map(Number) : [Number(value)])
    @IsArray()
    categoryIds?: number[];

    @IsOptional()
    @IsIn(['Easy', 'Medium', 'Hard']) 
    @ApiPropertyOptional({ enum: ['Easy', 'Medium', 'Hard'], example: 'Easy' })
    difficulty?: 'Easy' | 'Medium' | 'Hard';

    @IsOptional()
    @ApiPropertyOptional({
        example: '1-20',
        description: 'Cooking time range: "1-20", "20-30", "30-50", "60+"',
        enum: ['1-20', '20-30', '30-50', '60+']
    })
    cookingTimeRange?: string;

    // enables user to search like 'eggs, sugar, flour'
    @IsOptional()
    @IsString()
    ingredients?: string; 

    // searching by recipe name
    @IsOptional()
    @IsString()
    searchTerm?: string; 

    // only used in My Recipes Page
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ enum: ['public', 'private'] })
    status?: 'public' | 'private';
}
