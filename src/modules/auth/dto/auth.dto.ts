import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password, minimum 6 characters',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Indicates whether the login was successful',
    example: true
  })
  @IsString()
  @IsNotEmpty()
  success: boolean
}

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Indicates whether the logout was successful',
    example: true
  })
  @IsString()
  @IsNotEmpty()
  success: boolean
}


export class RegisterRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password, minimum 6 characters',
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Indicates whether the registration was successful',
    example: true
  })
  @IsString()
  @IsNotEmpty()
  success: boolean
}

export class NewPasswordRequestDto {
  @ApiProperty({
    description: 'New password, minimum 6 characters',
    example: 'newpassword123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Current password for verification',
    example: 'currentpassword123',
    minLength: 6
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;
}

export class NewPasswordResponseDto {
  @ApiProperty({
    description: 'Indicates whether the password change was successful',
    example: true
  })
  @IsString()
  @IsNotEmpty()
  success: boolean
}
