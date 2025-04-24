import { Test, TestingModule } from '@nestjs/testing';
import { MealPlanService } from './meal-plan.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';
import { AiMealGeneratorService } from '../ai-meal-generator/ai-meal-generator.service';

describe('MealPlanService', () => {
  let service: MealPlanService;
  let mealPlanRepository: Partial<Repository<MealPlan>> & {
    findOne: jest.Mock;
    find: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
    merge: jest.Mock;
    delete: jest.Mock;
  };
  let aiMealGeneratorService: Partial<AiMealGeneratorService> & {
    generateMealPlan: jest.Mock;
  };

  // Valid UUIDs for testing
  const validPlanId = '11111111-1111-4111-a111-111111111111';
  const validUserId = '22222222-2222-4222-a222-222222222222';
  const validCharacteristicId = '33333333-3333-4333-a333-333333333333';
  const nonExistentId = '00000000-0000-4000-a000-000000000000';

  const mockMealPlan = {
    id: validPlanId,
    name: 'Weight Loss Plan',
    durationInDays: 30,
    mealCharacteristicId: validCharacteristicId,
    userId: validUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mealPlanRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      delete: jest.fn(),
    };

    aiMealGeneratorService = {
      generateMealPlan: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MealPlanService,
        {
          provide: getRepositoryToken(MealPlan),
          useValue: mealPlanRepository,
        },
        {
          provide: AiMealGeneratorService,
          useValue: aiMealGeneratorService,
        },
      ],
    }).compile();

    service = module.get<MealPlanService>(MealPlanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a new meal plan', async () => {
      const createDto: CreateMealPlanDto = {
        name: 'Weight Loss Plan',
        durationInDays: 30,
        mealCharacteristicId: validCharacteristicId,
      };

      mealPlanRepository.create.mockReturnValue(mockMealPlan);
      mealPlanRepository.save.mockResolvedValue(mockMealPlan);

      const result = await service.create(createDto, validUserId);

      expect(mealPlanRepository.create).toHaveBeenCalledWith({
        ...createDto,
        userId: validUserId,
      });
      expect(mealPlanRepository.save).toHaveBeenCalledWith(mockMealPlan);
      expect(result).toEqual(mockMealPlan);
    });

    it('should throw ConflictException when create fails', async () => {
      const createDto: CreateMealPlanDto = {
        name: 'Weight Loss Plan',
        durationInDays: 30,
      };

      mealPlanRepository.create.mockReturnValue(mockMealPlan);
      mealPlanRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createDto, validUserId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of meal plans', async () => {
      mealPlanRepository.find.mockResolvedValue([mockMealPlan]);

      const result = await service.findAll();
      expect(result).toEqual([mockMealPlan]);
      expect(mealPlanRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByUser', () => {
    it('should return an array of user meal plans', async () => {
      mealPlanRepository.find.mockResolvedValue([mockMealPlan]);

      const result = await service.findAllByUser(validUserId);
      expect(result).toEqual([mockMealPlan]);
      expect(mealPlanRepository.find).toHaveBeenCalledWith({
        where: { userId: validUserId },
      });
    });
  });

  describe('findOne', () => {
    it('should return a meal plan when it exists', async () => {
      mealPlanRepository.findOne.mockResolvedValue(mockMealPlan);

      const result = await service.findOne(validPlanId);
      expect(result).toEqual(mockMealPlan);
      expect(mealPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: validPlanId },
        relations: ['mealCharacteristic'],
      });
    });

    it('should throw NotFoundException when meal plan does not exist', async () => {
      mealPlanRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when ID is not a valid UUID', async () => {
      await expect(service.findOne('not-a-uuid')).rejects.toThrow(
        NotFoundException,
      );
      expect(mealPlanRepository.findOne).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update and return the meal plan', async () => {
      const existingPlan = { ...mockMealPlan };

      const updateDto: UpdateMealPlanDto = {
        id: validPlanId,
        name: 'Updated Weight Loss Plan',
        durationInDays: 45,
      };

      mealPlanRepository.findOne.mockResolvedValue(existingPlan);

      mealPlanRepository.merge.mockImplementation(
        (target: MealPlan, source: Partial<MealPlan>) => {
          return { ...target, ...source };
        },
      );

      const updatedPlan = {
        ...existingPlan,
        name: 'Updated Weight Loss Plan',
        durationInDays: 45,
      };

      mealPlanRepository.save.mockResolvedValue(updatedPlan);

      const result = await service.update(updateDto);

      expect(mealPlanRepository.findOne).toHaveBeenCalledWith({
        where: { id: validPlanId },
        relations: ['mealCharacteristic'],
      });
      expect(mealPlanRepository.merge).toHaveBeenCalledWith(existingPlan, {
        name: 'Updated Weight Loss Plan',
        durationInDays: 45,
      });
      expect(result).toEqual(updatedPlan);
    });

    it('should throw NotFoundException when meal plan does not exist', async () => {
      mealPlanRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update({
          id: nonExistentId,
          name: 'Updated Plan',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the meal plan', async () => {
      mealPlanRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(validPlanId);
      expect(mealPlanRepository.delete).toHaveBeenCalledWith(validPlanId);
    });

    it('should throw NotFoundException when meal plan does not exist', async () => {
      mealPlanRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when ID is not a valid UUID', async () => {
      await expect(service.remove('not-a-uuid')).rejects.toThrow(
        NotFoundException,
      );
      expect(mealPlanRepository.delete).not.toHaveBeenCalled();
    });
  });
});
