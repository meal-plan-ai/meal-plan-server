import { Injectable, Logger } from '@nestjs/common';
import { User, NutritionPlan } from '~/domain/entities';
import { IDataService } from '~/infrastructure/data/repositories/interfaces';

@Injectable()
export class NutritionPlanService {
  constructor(
    private readonly dataService: IDataService,
    private readonly user: User,
    private readonly logger = new Logger(NutritionPlanService.name),
  ) {}

  async getAllNutritionPlans(): Promise<NutritionPlan[]> {
    try {
      return await this.dataService.nutritionPlans.find({
        where: { user: this.user },
      });
    } catch (error) {
      this.logger.error(
        'Error in getAllNutritionPlans service method',
        new Error(error).stack,
      );
      throw error;
    }
  }
}
