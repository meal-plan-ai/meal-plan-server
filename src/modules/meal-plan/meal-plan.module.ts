import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MealPlanController } from './meal-plan.controller';
import { MealPlanService } from './meal-plan.service';
import { OpenAiService } from 'src/modules/integrations/open-ai/open-ai.service';

@Module({
  imports: [ConfigModule],
  controllers: [MealPlanController],
  providers: [MealPlanService, OpenAiService],
})
export class MealPlanModule {}
