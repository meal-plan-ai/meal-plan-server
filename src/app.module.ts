import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { MealPlanModule } from './modules/meal-plan/meal-plan.module';
import { ProfileModule } from './modules/profile/profile.module';
import { MealCharacteristicModule } from './modules/meal-characteristic/meal-characteristic.module';
import { AiMealGeneratorModule } from './modules/ai-meal-generator/ai-meal-generator.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { StripeModule } from './modules/stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
    DatabaseModule,
    StripeModule,
    UsersModule,
    AuthModule,
    ProfileModule,
    MealPlanModule,
    MealCharacteristicModule,
    AiMealGeneratorModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
