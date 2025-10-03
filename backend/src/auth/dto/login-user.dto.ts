import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsString()
  @ApiProperty()
  identifier: string; 

  @IsString()
  @ApiProperty()
  password: string;
}

// export class LoginUserDto {
//   identifier: string;  
//   password: string;
// }

