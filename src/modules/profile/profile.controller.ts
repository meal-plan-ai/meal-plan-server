import { Controller, Get, Post, Put, Body, UseGuards, Req, Param, NotFoundException, Inject, forwardRef, Patch } from '@nestjs/common';
import { ProfileService } from '../profile/profile.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateProfileDto } from './dto/profile.dto';
import { UsersService } from '../users/users.service';
import { IProfile } from './entities/profile.interface';

interface RequestWithUser extends Request {
  user: {
    id: string;
    userId: string;
    email: string;
    [key: string]: any;
  };
}

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyProfile(@Req() request: RequestWithUser): Promise<IProfile> {
    const userId = request.user.userId || request.user.id;
    try {
      return await this.profileService.getProfile(userId);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Profile not found`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto
  ): Promise<IProfile> {
    try {
      console.log('Patch 1', updateProfileDto)
      return await this.profileService.updateProfile(updateProfileDto);

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Profile not found or could not be updated`);
    }
  }
}