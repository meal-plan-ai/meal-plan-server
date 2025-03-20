import { Controller, Get, UseGuards, Request, NotFoundException, ClassSerializerInterceptor, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current user profile',
    type: UserDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req): Promise<UserDto> {
    try {
      const userId = req.user.id;
      return await this.usersService.findOne(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('User not found');
    }
  }
}
