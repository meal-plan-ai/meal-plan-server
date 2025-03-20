import { ConfigService } from '@nestjs/config';
import { Controller, Post, Body, Res, UnauthorizedException, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import {
  LoginRequestDto,
  RegisterRequestDto,
  LoginResponseDto,
  NewPasswordRequestDto,
  NewPasswordResponseDto,
  LogoutResponseDto,
  RegisterResponseDto
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: LoginResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials'
  })
  @Post('login')
  async login(@Body() loginDto: LoginRequestDto, @Res({ passthrough: true }) response: Response): Promise<LoginResponseDto> {
    try {
      const result = await this.authService.login(loginDto);

      this.setTokenCookie(response, result.access_token);

      return { success: true };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    type: LogoutResponseDto
  })
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response): Promise<LogoutResponseDto> {
    response.clearCookie('token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { success: true };
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: RegisterResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or validation error'
  })
  @Post('register')
  async register(@Body() registerDto: RegisterRequestDto, @Res({ passthrough: true }) response: Response): Promise<RegisterResponseDto> {
    const result = await this.authService.register(registerDto);

    this.setTokenCookie(response, result.access_token);

    return { success: true };
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully changed',
    type: NewPasswordResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token or wrong current password'
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('new-password')
  async setNewPassword(
    @Body() newPasswordDto: NewPasswordRequestDto,
    @Req() request: RequestWithUser
  ): Promise<NewPasswordResponseDto> {
    return this.authService.setNewPassword(
      request.user.id,
      newPasswordDto.currentPassword,
      newPasswordDto.password
    );
  }

  private setTokenCookie(response: Response, token: string) {
    const expiresIn = this.configService.get<number>('JWT_EXPIRATION') || 3600;

    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresIn * 1000,
      path: '/',
    });
  }
}