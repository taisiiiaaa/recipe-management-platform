import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great recipe!', description: 'The content of the comment' })
  @IsNotEmpty()
  content: string;
}
