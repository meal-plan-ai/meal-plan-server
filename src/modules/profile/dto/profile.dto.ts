import { IsEmail, IsString, IsOptional, IsUUID, IsBoolean, IsDate } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class CreateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;
}

export class ProfileResponseDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsUUID()
  userId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class UserProfileResponseDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  isEmailVerified: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  profile: ProfileResponseDto;
}