import { Test, TestingModule } from '@nestjs/testing';
import { MealCharacteristicService } from './meal-characteristic.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealCharacteristic } from './entities/meal-characteristic.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import {
  CreateMealCharacteristicDto,
  UpdateMealCharacteristicDto,
} from './dto/meal-characteristic.dto';

describe('MealCharacteristicService', () => {
  let service: MealCharacteristicService;
  let mealCharacteristicRepository: Partial<Repository<MealCharacteristic>> & {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    merge: jest.Mock;
    delete: jest.Mock;
  };
  let mealPlanRepository: Partial<Repository<MealPlan>> & {
    find: jest.Mock;
  };

  // Valid UUIDs for testing
  const validCharacteristicId = '11111111-1111-4111-a111-111111111111';
  const validUserId = '22222222-2222-4222-a222-222222222222';
  const nonExistentId = '00000000-0000-4000-a000-000000000000';

  const mockMealCharacteristic = {
    id: validCharacteristicId,
    planName: 'Test Diet Plan',
    gender: 'Male',
    age: 30,
    height: 180,
    weight: 80,
    activityLevel: 'Moderate',
    goal: 'Weight Loss',
    targetDailyCalories: 2000,
    proteinPercentage: 30,
    fatPercentage: 30,
    carbsPercentage: 40,
    includeSnacks: 1,
    mealsPerDay: 3,
    medicalConditions: ['Diabetes'],
    dietType: ['Low Carb'],
    dietaryRestrictions: ['Gluten Free'],
    vitaminsAndMinerals: ['Vitamin C', 'Iron'],
    cookingComplexity: 'Standard',
    additionalPreferences: ['Organic'],
    userId: validUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mealCharacteristicRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    };

    mealPlanRepository = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealCharacteristicService,
        {
          provide: getRepositoryToken(MealCharacteristic),
          useValue: mealCharacteristicRepository,
        },
        {
          provide: getRepositoryToken(MealPlan),
          useValue: mealPlanRepository,
        },
      ],
    }).compile();

    service = module.get<MealCharacteristicService>(MealCharacteristicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new meal characteristic', async () => {
      const createDto: CreateMealCharacteristicDto = {
        planName: 'Test Diet Plan',
        gender: 'Male',
        age: 30,
        height: 180,
        weight: 80,
      };

      mealCharacteristicRepository.create.mockReturnValue(
        mockMealCharacteristic,
      );
      mealCharacteristicRepository.save.mockResolvedValue(
        mockMealCharacteristic,
      );

      const result = await service.create(createDto, validUserId);

      expect(mealCharacteristicRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: validUserId,
      });
      expect(mealCharacteristicRepository.save).toHaveBeenCalledWith(
        mockMealCharacteristic,
      );
      expect(result).toEqual(mockMealCharacteristic);
    });

    it('should throw ConflictException when create fails', async () => {
      const createDto: CreateMealCharacteristicDto = {
        planName: 'Test Diet Plan',
      };

      mealCharacteristicRepository.create.mockReturnValue(
        mockMealCharacteristic,
      );
      mealCharacteristicRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.create(createDto, validUserId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of meal characteristics', async () => {
      mealCharacteristicRepository.find.mockResolvedValue([
        mockMealCharacteristic,
      ]);

      const result = await service.findAll();
      expect(result).toEqual([mockMealCharacteristic]);
      expect(mealCharacteristicRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return an array of user meal characteristics', async () => {
      mealCharacteristicRepository.find.mockResolvedValue([
        mockMealCharacteristic,
      ]);

      const result = await service.findAllByUser(validUserId);
      expect(result).toEqual([mockMealCharacteristic]);
      expect(mealCharacteristicRepository.find).toHaveBeenCalledWith({
        where: { userId: validUserId },
      });
    });

    describe('findOneByIdAndUser', () => {
      it('should return a meal characteristic when it exists and belongs to user', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(
          mockMealCharacteristic,
        );

        const result = await service.findOneByIdAndUser(
          validCharacteristicId,
          validUserId,
        );

        expect(result).toEqual(mockMealCharacteristic);
        expect(mealCharacteristicRepository.findOne).toHaveBeenCalledWith({
          where: { id: validCharacteristicId, userId: validUserId },
        });
      });

      it('should throw NotFoundException when meal characteristic does not exist', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(null);

        await expect(
          service.findOneByIdAndUser(nonExistentId, validUserId),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw NotFoundException for invalid UUID', async () => {
        await expect(
          service.findOneByIdAndUser('invalid-uuid', validUserId),
        ).rejects.toThrow(NotFoundException);

        expect(mealCharacteristicRepository.findOne).not.toHaveBeenCalled();
      });
    });

    describe('updateByUserOwnership', () => {
      it('should update and return the meal characteristic', async () => {
        const existingCharacteristic = { ...mockMealCharacteristic };

        const updateDto: UpdateMealCharacteristicDto = {
          id: validCharacteristicId,
          planName: 'Updated Diet Plan',
          targetDailyCalories: 1800,
        };

        mealCharacteristicRepository.findOne.mockResolvedValue(
          existingCharacteristic,
        );

        mealCharacteristicRepository.merge.mockImplementation(
          (target: MealCharacteristic, source: Partial<MealCharacteristic>) => {
            return { ...target, ...source };
          },
        );

        const updatedCharacteristic = {
          ...existingCharacteristic,
          planName: 'Updated Diet Plan',
          targetDailyCalories: 1800,
        };

        mealCharacteristicRepository.save.mockResolvedValue(
          updatedCharacteristic,
        );

        const result = await service.updateByUserOwnership(
          updateDto,
          validUserId,
        );

        expect(mealCharacteristicRepository.findOne).toHaveBeenCalledWith({
          where: { id: validCharacteristicId, userId: validUserId },
        });
        expect(result).toEqual(updatedCharacteristic);
      });

      it('should throw NotFoundException when meal characteristic does not belong to user', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(null);

        const updateDto: UpdateMealCharacteristicDto = {
          id: validCharacteristicId,
          planName: 'Updated Diet Plan',
        };

        await expect(
          service.updateByUserOwnership(updateDto, 'different-user-id'),
        ).rejects.toThrow(NotFoundException);
      });
    });

    describe('removeByUserOwnership', () => {
      it('should remove the meal characteristic when no meal plans are related', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(
          mockMealCharacteristic,
        );
        mealPlanRepository.find.mockResolvedValue([]);
        mealCharacteristicRepository.delete.mockResolvedValue({ affected: 1 });

        const result = await service.removeByUserOwnership(
          validCharacteristicId,
          validUserId,
        );

        expect(mealCharacteristicRepository.findOne).toHaveBeenCalledWith({
          where: { id: validCharacteristicId, userId: validUserId },
        });
        expect(mealPlanRepository.find).toHaveBeenCalledWith({
          where: {
            mealCharacteristicId: validCharacteristicId,
            userId: validUserId,
          },
        });
        expect(mealCharacteristicRepository.delete).toHaveBeenCalledWith({
          id: validCharacteristicId,
          userId: validUserId,
        });
        expect(result).toBe(1);
      });

      it('should throw ConflictException when meal plans are using the characteristic', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(
          mockMealCharacteristic,
        );
        mealPlanRepository.find.mockResolvedValue([
          { id: 'plan-1', name: 'Test Plan 1' },
          { id: 'plan-2', name: 'Test Plan 2' },
        ]);

        await expect(
          service.removeByUserOwnership(validCharacteristicId, validUserId),
        ).rejects.toThrow(ConflictException);

        expect(mealCharacteristicRepository.delete).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException when meal characteristic does not belong to user', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(null);

        await expect(
          service.removeByUserOwnership(
            validCharacteristicId,
            'different-user-id',
          ),
        ).rejects.toThrow(NotFoundException);

        expect(mealPlanRepository.find).not.toHaveBeenCalled();
        expect(mealCharacteristicRepository.delete).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException for invalid UUID', async () => {
        await expect(
          service.removeByUserOwnership('invalid-uuid', validUserId),
        ).rejects.toThrow(NotFoundException);

        expect(mealCharacteristicRepository.findOne).not.toHaveBeenCalled();
        expect(mealPlanRepository.find).not.toHaveBeenCalled();
        expect(mealCharacteristicRepository.delete).not.toHaveBeenCalled();
      });

      it('should throw NotFoundException when delete affects no rows', async () => {
        mealCharacteristicRepository.findOne.mockResolvedValue(
          mockMealCharacteristic,
        );
        mealPlanRepository.find.mockResolvedValue([]);
        mealCharacteristicRepository.delete.mockResolvedValue({ affected: 0 });

        await expect(
          service.removeByUserOwnership(validCharacteristicId, validUserId),
        ).rejects.toThrow(NotFoundException);
      });
    });
  });

  describe('findOne', () => {
    it('should return a meal characteristic when it exists', async () => {
      mealCharacteristicRepository.findOne.mockResolvedValue(
        mockMealCharacteristic,
      );

      const result = await service.findOne(validCharacteristicId);
      expect(result).toEqual(mockMealCharacteristic);
      expect(mealCharacteristicRepository.findOne).toHaveBeenCalledWith({
        where: { id: validCharacteristicId },
      });
    });

    it('should throw NotFoundException when meal characteristic does not exist', async () => {
      mealCharacteristicRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the meal characteristic', async () => {
      const existingCharacteristic = { ...mockMealCharacteristic };

      const updateDto: UpdateMealCharacteristicDto = {
        id: validCharacteristicId,
        planName: 'Updated Diet Plan',
        targetDailyCalories: 1800,
      };

      mealCharacteristicRepository.findOne.mockResolvedValue(
        existingCharacteristic,
      );

      mealCharacteristicRepository.merge.mockImplementation(
        (target: MealCharacteristic, source: Partial<MealCharacteristic>) => {
          return { ...target, ...source };
        },
      );

      const updatedCharacteristic = {
        ...existingCharacteristic,
        planName: 'Updated Diet Plan',
        targetDailyCalories: 1800,
      };

      mealCharacteristicRepository.save.mockResolvedValue(
        updatedCharacteristic,
      );

      const result = await service.update(updateDto);

      expect(mealCharacteristicRepository.findOne).toHaveBeenCalledWith({
        where: { id: validCharacteristicId },
      });
      expect(mealCharacteristicRepository.merge).toHaveBeenCalledWith(
        existingCharacteristic,
        { planName: 'Updated Diet Plan', targetDailyCalories: 1800 },
      );
      expect(result).toEqual(updatedCharacteristic);
    });

    it('should throw NotFoundException when meal characteristic does not exist', async () => {
      mealCharacteristicRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          id: nonExistentId,
          planName: 'Updated Diet Plan',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the meal characteristic', async () => {
      mealCharacteristicRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(validCharacteristicId);

      expect(mealCharacteristicRepository.delete).toHaveBeenCalledWith(
        validCharacteristicId,
      );
      expect(result).toBe(1);
    });

    it('should throw NotFoundException when meal characteristic does not exist', async () => {
      mealCharacteristicRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException for invalid UUID', async () => {
      await expect(service.remove('invalid-uuid')).rejects.toThrow(
        NotFoundException,
      );
      expect(mealCharacteristicRepository.delete).not.toHaveBeenCalled();
    });
  });
});
