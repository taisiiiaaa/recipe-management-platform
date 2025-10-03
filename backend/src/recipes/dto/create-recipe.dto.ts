import { IsString, IsInt, IsBoolean, IsOptional, Min, MaxLength, IsIn, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

class IngredientInputDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  quantity?: string;
}

export class CreateRecipeDto {
  @IsString()
  @ApiProperty()
  @MaxLength(100)
  name: string;

  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  description?: string;

  @IsString()
  @ApiProperty()
  instructions: string;

  @IsIn(['Easy', 'Medium', 'Hard'])
  @ApiProperty()
  difficulty: 'Easy' | 'Medium' | 'Hard';

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @ApiProperty()
  @Min(1)
  cooking_time: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Type(() => Number) 
  @ApiProperty()
  categoryId: number;

  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @ApiProperty()
  @Type(() => Boolean)
  is_public?: boolean;

  @IsArray()
  @ApiProperty({
    type: [IngredientInputDto],
    example: [{ name: 'Flour', quantity: '2 cups' }],
  })
  @ValidateNested({ each: true })
  @Type(() => IngredientInputDto)
  ingredients: IngredientInputDto[];
}
