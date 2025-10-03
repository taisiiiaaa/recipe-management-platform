import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {  
    @ApiProperty()
    username: string;
  
    @ApiProperty()
    email: string;
  
    @ApiProperty()
    @MinLength(6)
    password: string;
  
    @ApiProperty()
    confirmPassword: string;
}

// export class RegisterUserDto {
//   @IsString()
//   name: string;

//   @IsString()
//   username: string;

//   @IsEmail()
//   email: string;

//   @IsString()
//   @MinLength(6)
//   password: string;

//   @IsString()
//   confirmPassword: string;
// }
