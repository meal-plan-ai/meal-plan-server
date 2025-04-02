import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MealCharacteristicModule } from './modules/meal-characteristic/meal-characteristic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    MealPlanModule,
    MealCharacteristicModule,
  ],
})
export class AppModule {}
