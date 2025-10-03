import { IsString, IsEmail, MinLength, Matches, isEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @ApiProperty()
  username: string;

  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @ApiProperty()
  password_hash: string;

  @IsString()
  @ApiProperty()
  confirmPassword: string;
}
