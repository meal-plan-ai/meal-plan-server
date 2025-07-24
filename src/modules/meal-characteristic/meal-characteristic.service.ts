import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { MealCharacteristic } from './entities/meal-characteristic.entity';
import {
  CreateMealCharacteristicDto,
  UpdateMealCharacteristicDto,
} from './dto/meal-characteristic.dto';
import { IMealCharacteristic } from './entities/meal-characteristic.interface';
import { isUUID } from 'class-validator';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';

@Injectable()
export class MealCharacteristicService {
  constructor(
    @InjectRepository(MealCharacteristic)
    private mealCharacteristicRepository: Repository<MealCharacteristic>,
    @InjectRepository(MealPlan)
    private mealPlanRepository: Repository<MealPlan>,
  ) {}

  async create(
    createMealCharacteristicDto: CreateMealCharacteristicDto,
    userId?: string,
  ): Promise<IMealCharacteristic> {
    try {
      const newMealCharacteristic = this.mealCharacteristicRepository.create({
        ...createMealCharacteristicDto,
        userId,
      });
      return await this.mealCharacteristicRepository.save(
        newMealCharacteristic,
      );
    } catch (error) {
      throw new ConflictException(
        'Failed to create meal characteristic: ' + error.message,
      );
    }
  }

  async findAll(): Promise<IMealCharacteristic[]> {
    return this.mealCharacteristicRepository.find();
  }

  async findAllByUser(userId: string): Promise<IMealCharacteristic[]> {
    return this.mealCharacteristicRepository.find({ where: { userId } });
  }

  async findOne(id: string): Promise<MealCharacteristic> {
    // Validate UUID format before querying database
    if (!isUUID(id)) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found`,
      );
    }

    const mealCharacteristic = await this.mealCharacteristicRepository.findOne({
      where: { id },
    });

    if (!mealCharacteristic) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found`,
      );
    }

    return mealCharacteristic;
  }

  async update(
    updateMealCharacteristicDto: UpdateMealCharacteristicDto,
  ): Promise<IMealCharacteristic> {
    const { id, ...updateData } = updateMealCharacteristicDto;

    const mealCharacteristic = await this.findOne(id);

    // Update and return the entity
    const updatedMealCharacteristic = this.mealCharacteristicRepository.merge(
      mealCharacteristic,
      updateData,
    );

    return this.mealCharacteristicRepository.save(updatedMealCharacteristic);
  }

  async remove(id: string): Promise<DeleteResult['affected'] | undefined> {
    if (!isUUID(id)) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found`,
      );
    }

    const result = await this.mealCharacteristicRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found`,
      );
    }

    return result.affected;
  }

  // Helper method to check for related meal plans by user
  private async checkForRelatedMealPlansByUser(
    mealCharacteristicId: string,
    userId: string,
  ): Promise<void> {
    const relatedMealPlans = await this.mealPlanRepository.find({
      where: { mealCharacteristicId, userId },
    });

    if (relatedMealPlans.length > 0) {
      throw new ConflictException(
        `Cannot delete meal characteristic. It is currently being used by ${relatedMealPlans.length} of your meal plan(s). Please delete those meal plans first or update them to use a different characteristic.`,
      );
    }
  }

  // Security helper methods
  async findOneByIdAndUser(
    id: string,
    userId: string,
  ): Promise<MealCharacteristic> {
    if (!isUUID(id)) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found`,
      );
    }

    const mealCharacteristic = await this.mealCharacteristicRepository.findOne({
      where: { id, userId },
    });

    if (!mealCharacteristic) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found or you don't have permission to access it`,
      );
    }

    return mealCharacteristic;
  }

  async updateByUserOwnership(
    updateMealCharacteristicDto: UpdateMealCharacteristicDto,
    userId: string,
  ): Promise<IMealCharacteristic> {
    const { id, ...updateData } = updateMealCharacteristicDto;

    const mealCharacteristic = await this.findOneByIdAndUser(id, userId);

    // Update and return the entity
    const updatedMealCharacteristic = this.mealCharacteristicRepository.merge(
      mealCharacteristic,
      updateData,
    );

    return this.mealCharacteristicRepository.save(updatedMealCharacteristic);
  }

  async removeByUserOwnership(
    id: string,
    userId: string,
  ): Promise<DeleteResult['affected'] | undefined> {
    if (!isUUID(id)) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found`,
      );
    }

    // First check if the meal characteristic exists and belongs to user
    await this.findOneByIdAndUser(id, userId);

    await this.checkForRelatedMealPlansByUser(id, userId);

    const result = await this.mealCharacteristicRepository.delete({
      id,
      userId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Meal characteristic with ID ${id} not found or you don't have permission to delete it`,
      );
    }

    return result.affected;
  }
}
