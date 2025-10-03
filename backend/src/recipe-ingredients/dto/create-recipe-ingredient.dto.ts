import { IsInt, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeIngredientDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  ingredientId: number;

  @ApiProperty({ example: '200g' })
  @IsString()
  quantity: string;
}
