import { IsEmail, IsString, IsOptional, IsUUID, IsBoolean, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Profile UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  id: string;

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

export class CreateProfileDto {
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

export class ProfileResponseDto {
  @ApiProperty({
    description: 'Profile UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  id: string;

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

  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z'
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T00:00:00Z'
  })
  @IsDate()
  updatedAt: Date;
}

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Email verification status',
    example: true
  })
  @IsBoolean()
  isEmailVerified: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z'
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T00:00:00Z'
  })
  @IsDate()
  updatedAt: Date;

  @ApiProperty({
    description: 'User profile information',
    type: ProfileResponseDto
  })
  profile: ProfileResponseDto;
}