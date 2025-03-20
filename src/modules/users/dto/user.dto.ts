import { IsEmail, IsString, IsUUID, } from 'class-validator';

export class UserDto {
  @IsUUID()
  id: string;

  @IsEmail()
  email: string;

  @IsUUID()
  profileId?: string;

  @IsString()
  createdAt: Date;

  @IsString()
  updatedAt: Date;
}

