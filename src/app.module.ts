import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { ProfileModule } from './modules/profile/profile.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    MealPlanModule,
  ],
})
export class AppModule {}
