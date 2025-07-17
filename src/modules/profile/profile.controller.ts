import {
  Controller,
  Get,
  Body,
  UseGuards,
  Req,
  NotFoundException,
  Inject,
  forwardRef,
  Patch,
} from '@nestjs/common';
import { ProfileService } from '../profile/profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { UpdateProfileDto, ProfileResponseDto } from './dto/profile.dto';
import { UsersService } from '../users/users.service';
import { IProfile } from './entities/profile.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    id: string;
    userId: string;
    email: string;
    [key: string]: unknown;
  };
}

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  @ApiBearerAuth()
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

  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile successfully updated',
    type: ProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 404,
    description: 'Profile not found or could not be updated',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @Body() updateProfileDto: UpdateProfileDto,
    @Req() request: RequestWithUser,
  ): Promise<IProfile> {
    try {
      // Ensure user can only update their own profile
      const userId = request.user.userId || request.user.id;
      // Remove id from DTO as we'll use userId for security
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...profileUpdateData } = updateProfileDto;
      return await this.profileService.updateProfileByUserId(
        userId,
        profileUpdateData,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Profile not found or could not be updated`);
    }
  }
}
