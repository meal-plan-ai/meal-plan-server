import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, ObjectLiteral, Repository, EntitySchema } from 'typeorm';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

// Define a type that matches what getRepositoryToken expects
type EntityClassOrSchema =
  | { new (...args: unknown[]): object }
  | EntitySchema<ObjectLiteral>;

/**
 * Create a test application with a test database
 * @returns A properly typed INestApplication instance
 */
export async function createTestingApp(): Promise<INestApplication> {
  try {
    // Ensure we're using the test environment
    process.env.NODE_ENV = 'test';

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();

    const configService = app.get(ConfigService);
    const jwtSecret = configService.get<string>('JWT_SECRET');

    // Log database connection to help diagnose issues
    console.log(`Using database: ${configService.get<string>('DATABASE_URL')}`);

    app.use(cookieParser(jwtSecret));

    app.enableCors({
      origin: true,
      credentials: true,
    });

    await app.init();

    // Ensure database is clean at the start
    await resetDatabase(app);

    return app;
  } catch (error) {
    console.error('Failed to create testing app:', error);
    throw error;
  }
}

/**
 * Utility to clean a specific repository in tests
 */
export async function cleanRepository<T extends ObjectLiteral>(
  app: INestApplication,
  entity: EntityClassOrSchema,
): Promise<void> {
  try {
    const token = getRepositoryToken(entity);
    const repository = app.get<Repository<T>>(token);
    await repository.clear();
  } catch (error) {
    console.error('Failed to clean repository:', error);
    throw error;
  }
}

/**
 * Utility to clean all tables in the test database
 */
export async function cleanDatabase(app: INestApplication): Promise<void> {
  try {
    const dataSource = app.get(DataSource);
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);
      await repository.clear();
    }
  } catch (error) {
    console.error('Failed to clean database:', error);
    throw error;
  }
}

/**
 * More thorough database reset for tests - drops and recreates tables
 */
export async function resetDatabase(app: INestApplication): Promise<void> {
  try {
    const dataSource = app.get(DataSource);

    // Check if database is connected
    if (!dataSource.isInitialized) {
      console.log('Waiting for database connection...');
      await waitForDatabase(dataSource);
    }

    // Drop all tables and recreate schema
    await dataSource.synchronize(true);
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

/**
 * Utility to wait for database to be available
 */
async function waitForDatabase(
  dataSource: DataSource,
  retries = 5,
  delay = 2000,
): Promise<void> {
  let attempts = 0;

  while (attempts < retries) {
    try {
      if (!dataSource.isInitialized) {
        await dataSource.initialize();
      }

      // Test the connection with a simple query
      await dataSource.query('SELECT 1');
      console.log('Database connection established');
      return;
    } catch (error) {
      attempts++;
      console.log(
        `Database connection attempt ${attempts}/${retries} failed. Retrying in ${delay}ms...`,
      );
      console.error('Connection error:', error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Failed to connect to database after multiple attempts');
}
