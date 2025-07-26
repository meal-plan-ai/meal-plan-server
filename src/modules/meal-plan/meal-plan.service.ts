import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { MealPlan, AiGenerationStatus } from './entities/meal-plan.entity';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';
import { IMealPlan } from './entities/meal-plan.interface';
import { isUUID } from 'class-validator';
import { AiMealGeneratorService } from '../ai-meal-generator/ai-meal-generator.service';
import { AiGeneratedMealPlan } from '../ai-meal-generator/entities/ai-generated-meal-plan.entity';

@Injectable()
export class MealPlanService {
  constructor(
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
    private aiMealGeneratorService: AiMealGeneratorService,
  ) {}

  async create(
    createMealPlanDto: CreateMealPlanDto,
    userId?: string,
  ): Promise<IMealPlan> {
    try {
      const newMealPlan = this.mealPlanRepository.create({
        ...createMealPlanDto,
        userId,
      });
      return await this.mealPlanRepository.save(newMealPlan);
    } catch (error) {
      throw new ConflictException(
        'Failed to create meal plan: ' + error.message,
      );
    }
  }

  async findAll(): Promise<IMealPlan[]> {
    return this.mealPlanRepository.find();
  }

  async findAllByUser(userId: string): Promise<IMealPlan[]> {
    return this.mealPlanRepository.find({ where: { userId } });
  }

  async findOne(id: string): Promise<MealPlan> {
    // Validate UUID format before querying database
    if (!isUUID(id)) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id },
      relations: ['mealCharacteristic'],
    });

    if (!mealPlan) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    return mealPlan;
  }

  async update(updateMealPlanDto: UpdateMealPlanDto): Promise<IMealPlan> {
    const { id, ...updateData } = updateMealPlanDto;

    const mealPlan = await this.findOne(id);

    // Update and return the entity
    const updatedMealPlan = this.mealPlanRepository.merge(mealPlan, updateData);

    return this.mealPlanRepository.save(updatedMealPlan);
  }

  async remove(id: string): Promise<DeleteResult['affected'] | undefined> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    const result = await this.mealPlanRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    return result.affected;
  }

  async generateAiPlan(id: string): Promise<AiGeneratedMealPlan> {
    const plan = await this.mealPlanRepository.findOne({
      where: { id },
      relations: ['mealCharacteristic'],
    });

    if (!plan) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    const generatedPlan =
      await this.aiMealGeneratorService.generateMealPlan(plan);

    return generatedPlan;
  }

  // Security helper methods
  async findOneByIdAndUser(id: string, userId: string): Promise<MealPlan> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    const mealPlan = await this.mealPlanRepository.findOne({
      where: { id, userId },
      relations: ['mealCharacteristic'],
    });

    if (!mealPlan) {
      throw new NotFoundException(
        `Meal plan with ID ${id} not found or you don't have permission to access it`,
      );
    }

    return mealPlan;
  }

  async updateByUserOwnership(
    updateMealPlanDto: UpdateMealPlanDto,
    userId: string,
  ): Promise<IMealPlan> {
    const { id, ...updateData } = updateMealPlanDto;

    const mealPlan = await this.findOneByIdAndUser(id, userId);

    // Update and return the entity
    const updatedMealPlan = this.mealPlanRepository.merge(mealPlan, updateData);

    return this.mealPlanRepository.save(updatedMealPlan);
  }

  async removeByUserOwnership(
    id: string,
    userId: string,
  ): Promise<DeleteResult['affected'] | undefined> {
    if (!isUUID(id)) {
      throw new NotFoundException(`Meal plan with ID ${id} not found`);
    }

    // First check if the meal plan exists and belongs to user
    await this.findOneByIdAndUser(id, userId);

    const result = await this.mealPlanRepository.delete({ id, userId });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Meal plan with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    return result.affected;
  }

  async generateAiPlanByUserOwnership(
    id: string,
    userId: string,
  ): Promise<AiGeneratedMealPlan> {
    const plan = await this.mealPlanRepository.findOne({
      where: { id, userId },
      relations: ['mealCharacteristic'],
    });

    if (!plan) {
      throw new NotFoundException(
        `Meal plan with ID ${id} not found or you don't have permission to access it`,
      );
    }

    // Check if generation is already in progress
    if (plan.aiGenerationStatus === AiGenerationStatus.IN_PROGRESS) {
      throw new ConflictException(
        'AI meal plan generation is already in progress for this meal plan',
      );
    }

    // Set status to in_progress before starting generation
    await this.mealPlanRepository.update(id, {
      aiGenerationStatus: AiGenerationStatus.IN_PROGRESS,
    });

    try {
      const generatedPlan =
        await this.aiMealGeneratorService.generateMealPlan(plan);

      // Set status to completed after successful generation
      await this.mealPlanRepository.update(id, {
        aiGenerationStatus: AiGenerationStatus.COMPLETED,
      });

      return generatedPlan;
    } catch (error) {
      // Set status to failed if generation fails
      await this.mealPlanRepository.update(id, {
        aiGenerationStatus: AiGenerationStatus.FAILED,
      });
      throw error;
    }
  }
}
