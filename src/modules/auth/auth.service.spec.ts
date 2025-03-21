import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ProfileService } from '../profile/profile.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(() => 'hashedPassword'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: Partial<UsersService> & {
    findByEmail: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    updateProfileId: jest.Mock;
    updatePassword: jest.Mock;
  };
  let profileService: Partial<ProfileService> & {
    createProfile: jest.Mock;
  };
  let jwtService: Partial<JwtService> & {
    sign: jest.Mock;
  };

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    password: 'hashedPassword',
    profileId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProfile = {
    id: 'profile-id',
    userId: 'user-id',
    firstName: 'Test',
    lastName: 'User',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Create mock implementations
    usersService = {
      findByEmail: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      updateProfileId: jest.fn(),
      updatePassword: jest.fn(),
    };

    profileService = {
      createProfile: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(() => 'mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: ProfileService,
          useValue: profileService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'JWT_SECRET') return 'test-secret';
              if (key === 'JWT_EXPIRATION') return 3600;
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(result).toEqual(mockUser);
    });

    it('should return null when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        'test@example.com',
        'wrong-password',
      );
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        'nonexistent@example.com',
        'password',
      );
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token when login is successful', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException when login fails', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should create a new user and profile', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(mockUser);
      profileService.createProfile.mockResolvedValue(mockProfile);

      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.register(registerDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(profileService.createProfile).toHaveBeenCalledWith(mockUser.id, {
        firstName: 'Test',
        lastName: 'User',
      });
      expect(usersService.updateProfileId).toHaveBeenCalledWith(
        mockUser.id,
        mockProfile.id,
      );

      expect(result).toEqual({
        access_token: 'mock-jwt-token',
        user: {
          id: 'user-id',
          email: 'test@example.com',
          profileId: null,
          createdAt: expect.any(Date) as unknown as Date,
          updatedAt: expect.any(Date) as unknown as Date,
        },
      });
    });

    it('should throw BadRequestException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser);

      const registerDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('setNewPassword', () => {
    it('should update password when current password is correct', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.setNewPassword(
        'user-id',
        'current-password',
        'new-password',
      );

      expect(usersService.findOne).toHaveBeenCalledWith('user-id');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'current-password',
        'hashedPassword',
      );
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        'user-id',
        'new-password',
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.setNewPassword('user-id', 'wrong-password', 'new-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
