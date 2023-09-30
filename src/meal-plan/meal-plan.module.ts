import { Module } from '@nestjs/common';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { OpenAiService } from '../integrations/open-ai/open-ai.service';

@Module({
  controllers: [MealPlanController],
  providers: [MealPlanService, OpenAiService],
})
export class MealPlanModule {}
