import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @IsString()
  @IsNotEmpty()
  success: boolean
}

export class LogoutResponseDto {
  @IsString()
  @IsNotEmpty()
  success: boolean
}


export class RegisterRequestDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class RegisterResponseDto {
  @IsString()
  @IsNotEmpty()
  success: boolean
}

export class NewPasswordRequestDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  currentPassword: string;
}

export class NewPasswordResponseDto {
  @IsString()
  @IsNotEmpty()
  success: boolean
}
