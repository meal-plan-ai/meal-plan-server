import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';
import { User } from '../../users/entities/user.entity';

interface JwtValidatedUser {
  id: string;
  email: string;
  userId: string;
}

// Type guard function to check if object is a User
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'email' in obj &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).email === 'string'
  );
}

const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    token = req.cookies['token'] as string | null;
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtValidatedUser> {
    try {
      if (!payload.sub) {
        throw new UnauthorizedException('Invalid token payload');
      }

      const subId = String(payload.sub);
      const userResult = await this.usersService.findOne(subId);

      if (!userResult) {
        throw new UnauthorizedException('User not found');
      }

      if (!isUser(userResult)) {
        throw new UnauthorizedException('Invalid user data');
      }

      // Now TypeScript knows this is a valid User
      return {
        id: userResult.id,
        email: userResult.email,
        userId: subId,
      };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
