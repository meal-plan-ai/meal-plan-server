import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => {
        // Get database URL from environment or fallback
        const dbUrl =
          'postgresql://postgres:postgres@localhost:5433/meal_plan_test';
        return {
          type: 'postgres',
          url: dbUrl,
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // Safe for testing, recreates schema each run
          dropSchema: true, // Clean state for each test run
          // Add explicit connection options for CI environments
          ssl: false,
        };
      },
    }),
  ],
})
export class TestDatabaseModule {}
