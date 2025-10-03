import { IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRecipeStatusDto {
  @IsBoolean()
  @ApiProperty({ description: 'Set recipe visibility status (public/private)' })
  is_public: boolean;
}
