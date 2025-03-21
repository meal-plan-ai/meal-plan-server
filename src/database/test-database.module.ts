import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Get database URL from environment or fallback
        const dbUrl =
          configService.get<string>('TEST_DATABASE_URL') ||
          configService
            .get<string>('DATABASE_URL')
            ?.replace('meal_plan', 'meal_plan_test');

        console.log(`Using test database URL: ${dbUrl}`);

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
