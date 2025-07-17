import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { createTestingApp, resetDatabase } from '../../../test/test-utils';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import '../../../src/types/http-server';

describe('MealCharacteristicController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let httpRequest: ReturnType<typeof supertest>;
  let authToken: string;
  let user: User;

  // Valid UUID format but doesn't exist in the database
  const nonExistentId = '00000000-0000-4000-a000-000000000000';

  beforeAll(async () => {
    try {
      app = await createTestingApp();
      userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      httpRequest = supertest(app.getHttpServer());
    } catch (error) {
      console.error(
        'Failed to set up MealCharacteristicController tests:',
        error,
      );
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  }, 10000);

  beforeEach(async () => {
    await resetDatabase(app);

    try {
      // Create a test user
      const response = await httpRequest.post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      // Get token from cookie
      if (response.headers['set-cookie']) {
        const cookies = response.headers['set-cookie'] as unknown as string[];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        if (tokenCookie) {
          authToken = tokenCookie.split(';')[0].replace('token=', '');
        }
      }

      // Get user ID
      const users = await userRepository.find();
      if (users.length > 0) {
        user = { ...users[0] };
      } else {
        throw new Error('Failed to create test user');
      }
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  describe('POST /meal-characteristics', () => {
    it('should create a new meal characteristic', async () => {
      const createDto = {
        planName: 'Test Diet Plan',
        gender: 'Male',
        age: 30,
        height: 180,
        weight: 80,
        activityLevel: 'Moderate',
        goal: 'Weight Loss',
        targetDailyCalories: 2000,
        proteinPercentage: 30,
        fatPercentage: 30,
        carbsPercentage: 40,
        includeSnacks: 1,
        mealsPerDay: 3,
        medicalConditions: ['Diabetes'],
        dietType: ['Low Carb'],
        dietaryRestrictions: ['Gluten Free'],
        vitaminsAndMinerals: ['Vitamin C', 'Iron'],
        cookingComplexity: 'Standard',
        additionalPreferences: ['Organic'],
      };

      const response = await httpRequest
        .post('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('planName', 'Test Diet Plan');
      expect(response.body.data).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.post('/meal-characteristics').expect(401);
    });
  });

  describe('GET /meal-characteristics', () => {
    it('should return user meal characteristics only (requires authentication)', async () => {
      // First create a meal characteristic
      const createDto = {
        planName: 'My Diet Plan',
        gender: 'Female',
      };

      await httpRequest
        .post('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const response = await httpRequest
        .get('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('planName');
      expect(response.body.data[0]).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get('/meal-characteristics').expect(401);
    });
  });

  describe('GET /meal-characteristics/user', () => {
    it('should return user meal characteristics', async () => {
      // First create a meal characteristic
      const createDto = {
        planName: 'My Personal Diet Plan',
        gender: 'Male',
      };

      await httpRequest
        .post('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const response = await httpRequest
        .get('/meal-characteristics/user')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get('/meal-characteristics/user').expect(401);
    });
  });

  describe('GET /meal-characteristics/:id', () => {
    it('should return a meal characteristic by ID (owner only)', async () => {
      // First create a meal characteristic
      const createDto = {
        planName: 'Diet Plan for GET test',
        gender: 'Male',
      };

      const createResponse = await httpRequest
        .post('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const id = createResponse.body.data.id as string;

      const response = await httpRequest
        .get(`/meal-characteristics/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', id);
      expect(response.body.data).toHaveProperty(
        'planName',
        'Diet Plan for GET test',
      );
      expect(response.body.data).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest
        .get(`/meal-characteristics/${nonExistentId}`)
        .expect(401);
    });

    it('should return 404 for non-existent ID', async () => {
      await httpRequest
        .get(`/meal-characteristics/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /meal-characteristics/:id', () => {
    it('should update a meal characteristic', async () => {
      // First create a meal characteristic
      const createDto = {
        planName: 'Diet Plan for PATCH test',
        gender: 'Male',
      };

      const createResponse = await httpRequest
        .post('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const id = createResponse.body.data.id as string;

      const updateDto = {
        planName: 'Updated Diet Plan',
        targetDailyCalories: 1800,
      };

      await httpRequest
        .patch(`/meal-characteristics/${id}`)
        .set('Cookie', `token=${authToken}`)
        .send(updateDto)
        .expect(200);

      // Verify the update
      const response = await httpRequest
        .get(`/meal-characteristics/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty(
        'planName',
        'Updated Diet Plan',
      );
      expect(response.body.data).toHaveProperty('targetDailyCalories', 1800);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest
        .patch('/meal-characteristics/some-id')
        .send({ planName: 'Test' })
        .expect(401);
    });

    it('should return 404 for non-existent ID', async () => {
      await httpRequest
        .patch(`/meal-characteristics/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`)
        .send({ planName: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /meal-characteristics/:id', () => {
    it('should delete a meal characteristic', async () => {
      // First create a meal characteristic
      const createDto = {
        planName: 'Diet Plan for DELETE test',
        gender: 'Male',
      };

      const createResponse = await httpRequest
        .post('/meal-characteristics')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const id = createResponse.body.data.id as string;

      // Delete it
      await httpRequest
        .delete(`/meal-characteristics/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      // Verify it's deleted
      await httpRequest
        .get(`/meal-characteristics/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.delete('/meal-characteristics/some-id').expect(401);
    });

    it('should return 404 for non-existent ID', async () => {
      await httpRequest
        .delete(`/meal-characteristics/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });
});
