import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MealPlanModule } from './meal-plan/meal-plan.module';

@Module({
  imports: [ConfigModule.forRoot(), MealPlanModule],
})
export class AppModule {}
