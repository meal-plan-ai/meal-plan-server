import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';
import { NotFoundException } from '@nestjs/common';

type UpdateProfileDto = {
  id: string;
  firstName?: string;
  lastName?: string;
};

type CreateProfileDto = {
  firstName: string;
  lastName: string;
};

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository: Partial<Repository<Profile>> & {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    merge: jest.Mock;
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
    profileRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(Profile),
          useValue: profileRepository,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return a profile when it exists', async () => {
      profileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-id');
      expect(result).toEqual(mockProfile);
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createProfile', () => {
    it('should create and return a new profile', async () => {
      profileRepository.create.mockReturnValue(mockProfile);
      profileRepository.save.mockResolvedValue(mockProfile);

      const profileData: CreateProfileDto = {
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await service.createProfile('user-id', profileData);

      expect(profileRepository.create).toHaveBeenCalledWith({
        userId: 'user-id',
        ...profileData,
      });
      expect(profileRepository.save).toHaveBeenCalledWith(mockProfile);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update and return the profile', async () => {
      const existingProfile = { ...mockProfile };

      const updateData: UpdateProfileDto = {
        id: 'profile-id',
        firstName: 'Updated',
        lastName: 'Name',
      };

      profileRepository.findOne.mockResolvedValue(existingProfile);

      profileRepository.merge.mockImplementation(
        (target: Profile, source: UpdateProfileDto) => {
          Object.assign(target, {
            firstName: source.firstName,
            lastName: source.lastName,
          });
          return target;
        },
      );

      const updatedProfile = {
        ...existingProfile,
        firstName: 'Updated',
        lastName: 'Name',
      };

      profileRepository.save.mockResolvedValue(updatedProfile);

      const result = await service.updateProfile(updateData);

      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'profile-id' },
      });
      expect(profileRepository.merge).toHaveBeenCalledWith(
        existingProfile,
        updateData,
      );
      expect(result).toEqual(updatedProfile);
    });

    it('should throw NotFoundException when profile does not exist', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile({
          id: 'nonexistent-id',
          firstName: 'Updated',
          lastName: 'Name',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
