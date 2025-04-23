import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlanModule } from '../meal-plan/meal-plan.module';
import { MealCharacteristicModule } from '../meal-characteristic/meal-characteristic.module';
import { AiGeneratedMealPlan } from './entities/ai-generated-meal-plan.entity';
import { AiMealGeneratorService } from './ai-meal-generator.service';
import { OpenAiModule } from '../integrations/open-ai/open-ai.module';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiGeneratedMealPlan]),
    forwardRef(() => MealPlanModule),
    MealCharacteristicModule,
    OpenAiModule,
    TypeOrmModule.forFeature([MealPlan]),
  ],
  controllers: [],
  providers: [AiMealGeneratorService],
  exports: [AiMealGeneratorService],
})
export class AiMealGeneratorModule {}
