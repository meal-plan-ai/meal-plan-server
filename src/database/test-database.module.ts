import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: (configService.get<string>('TEST_DATABASE_URL') ||
          configService
            .get<string>('DATABASE_URL')
            ?.replace('meal_plan', 'meal_plan_test')) as string,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true, // Safe for testing, recreates schema each run
        dropSchema: true, // Clean state for each test run
      }),
    }),
  ],
})
export class TestDatabaseModule {}
