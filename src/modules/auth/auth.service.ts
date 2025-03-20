import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import {
  LoginRequestDto,
  NewPasswordRequestDto,
  RegisterRequestDto,
} from './dto/auth.dto';
import { ProfileService } from '../profile/profile.service';
import { CreateProfileDto } from '../profile/dto/profile.dto';
import { NewPasswordResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private profileService: ProfileService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }

    return null;
  }

  async login(loginDto: LoginRequestDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      access_token: this.generateToken(user),
    };
  }

  async register(registerDto: RegisterRequestDto) {
    const { firstName, lastName, ...userData } = registerDto;
    const existingUser = await this.usersService.findByEmail(userData.email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.usersService.create(userData);

    const profileData: CreateProfileDto = {
      firstName,
      lastName,
    };
    const profile = await this.profileService.createProfile(
      user.id,
      profileData,
    );

    await this.usersService.updateProfileId(user.id, profile.id);

    return {
      access_token: this.generateToken(user),
      user: this.sanitizeUser(user),
    };
  }

  async setNewPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<NewPasswordResponseDto> {
    const user = await this.usersService.findOne(userId);
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, newPassword);

    return { success: true };
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private sanitizeUser(user: User) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
