import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, ResetPasswordDto, NewPasswordDto, SocialLoginDto } from './dto/auth.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.create(registerDto);

    return {
      access_token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async getProfile(userId: string) {
    return this.sanitizeUser(await this.usersService.findOne(userId));
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(resetPasswordDto.email);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const token = randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    await this.usersService.updateResetPasswordToken(
      resetPasswordDto.email,
      token,
      expires,
    );

    return { message: 'Password reset initiated', token };
  }

  async setNewPassword(newPasswordDto: NewPasswordDto) {
    const success = await this.usersService.setNewPassword(
      newPasswordDto.token,
      newPasswordDto.password,
    );

    if (!success) {
      throw new BadRequestException('Invalid or expired token');
    }

    return { message: 'Password has been reset successfully' };
  }

  async googleLogin(socialLoginDto: SocialLoginDto) {
    let user = await this.usersService.findByEmail(socialLoginDto.token);

    if (!user) {
      user = await this.usersService.create({
        email: socialLoginDto.token,
        password: randomBytes(16).toString('hex'),
        firstName: 'Google',
        lastName: 'User',
      });
    }

    return {
      access_token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async appleLogin(socialLoginDto: SocialLoginDto) {
    let user = await this.usersService.findByEmail(socialLoginDto.token);

    if (!user) {
      user = await this.usersService.create({
        email: socialLoginDto.token,
        password: randomBytes(16).toString('hex'),
        firstName: 'Apple',
        lastName: 'User',
      });
    }

    return {
      access_token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    const { password, resetPasswordToken, resetPasswordExpires, ...result } = user;
    return result;
  }
} 