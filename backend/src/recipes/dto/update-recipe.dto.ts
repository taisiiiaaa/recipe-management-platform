import { IsString, IsInt, IsOptional, IsArray, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

class IngredientInputDto {
  @IsString()
  @ApiPropertyOptional()
  name: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  quantity?: string;
}

export class UpdateRecipeDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ enum: ['Easy', 'Medium', 'Hard'] })
  difficulty?: "Easy" | "Medium" | "Hard";

  @IsInt()
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? parseInt(value) : undefined))
  cooking_time?: number;

  @IsInt()
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number) 
  @Transform(({ value }) => (value !== undefined ? parseInt(value) : undefined))
  categoryId?: number;

  @IsOptional()
  @ApiPropertyOptional()
  @IsBoolean()
  @Type(() => Boolean)
  @Transform(({ value }) => value === 'true' || value === true)
  is_public?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => IngredientInputDto)
  @ApiPropertyOptional({
    type: [IngredientInputDto],
    example: [{ name: 'Butter', quantity: '100g' }],
  })
  ingredients?: IngredientInputDto[];

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional image file to update the recipe image',
  })
  imagePath?: any;

  @Expose()
  category: {
    id: number;
    name: string;
  }
}

