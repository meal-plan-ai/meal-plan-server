import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataServiceModule } from './infrastructure/data/repositories';

import { MealPlanModule } from './meal-plan/meal-plan.module';

@Module({
  imports: [ConfigModule.forRoot(), MealPlanModule, DataServiceModule],
})
export class AppModule {}
