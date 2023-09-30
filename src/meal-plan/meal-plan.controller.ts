import { Controller, Get } from '@nestjs/common';
import { MealPlanService } from './meal-plan.service';

@Controller('meal-plan')
export class MealPlanController {
  constructor(private mealPlanService: MealPlanService) {}

  @Get('/create-plan')
  async createPlan(): Promise<any> {
    const data = await this.mealPlanService.getMealPlan();

    return data;
  }
}
