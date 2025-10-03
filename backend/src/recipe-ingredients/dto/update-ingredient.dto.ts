import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIngredientDto {
  @ApiProperty({ example: '300g' })
  @IsString()
  quantity: string;
}
