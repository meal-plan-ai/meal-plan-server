import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { MealPlan } from './entities/meal-plan.entity';
import { AiMealGeneratorModule } from '../ai-meal-generator/ai-meal-generator.module';

@Module({
  imports: [TypeOrmModule.forFeature([MealPlan]), AiMealGeneratorModule],
  controllers: [MealPlanController],
  providers: [MealPlanService],
  exports: [MealPlanService],
})
export class MealPlanModule {}
