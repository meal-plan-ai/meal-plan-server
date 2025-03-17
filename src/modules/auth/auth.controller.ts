import { Controller, Post, Body, Get, UseGuards, Req, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ResetPasswordDto, NewPasswordDto, SocialLoginDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

interface RequestWithUser extends Request {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    console.log('Post(login), result: ', result);
    this.setTokenCookie(response, result.access_token);

    return { user: result.user };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.register(registerDto);

    this.setTokenCookie(response, result.access_token);

    return { user: result.user };
  }

  @Post('google')
  async googleLogin(@Body() socialLoginDto: SocialLoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.googleLogin(socialLoginDto);

    this.setTokenCookie(response, result.access_token);

    return { user: result.user };
  }

  @Post('apple')
  async appleLogin(@Body() socialLoginDto: SocialLoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.appleLogin(socialLoginDto);

    this.setTokenCookie(response, result.access_token);

    return { user: result.user };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('token', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return { message: 'Logged out successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() request: RequestWithUser) {
    return request.user;
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('new-password')
  async setNewPassword(@Body() newPasswordDto: NewPasswordDto) {
    return this.authService.setNewPassword(newPasswordDto);
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