import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { CreateMealPlanDto, UpdateMealPlanDto } from './dto/meal-plan.dto';
import { IMealPlan } from './entities/meal-plan.interface';
import { isUUID } from 'class-validator';

@Injectable()
export class MealPlanService {
  constructor(
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
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
}
