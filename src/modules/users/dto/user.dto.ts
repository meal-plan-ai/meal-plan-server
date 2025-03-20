import { IsEmail, IsString, IsUUID, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'User UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
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
    description: 'Profile UUID',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false
  })
  @IsUUID()
  profileId?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z'
  })
  @IsString()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-01-02T00:00:00Z'
  })
  @IsString()
  updatedAt: Date;
}
