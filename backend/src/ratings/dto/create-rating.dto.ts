import { Min, Max, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRatingDto {
  @ApiProperty({ example: 4.5, description: 'Rating value between 1 and 5 (float allowed)' })
  @IsNumber()
  @Min(1)
  @Max(5)
  value: number;
}