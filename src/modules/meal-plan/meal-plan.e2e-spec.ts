import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { createTestingApp, resetDatabase } from '../../../test/test-utils';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import '../../../src/types/http-server';

describe('MealPlanController (e2e)', () => {
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
      console.error('Failed to set up MealPlanController tests:', error);
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

  describe('POST /meal-plans', () => {
    it('should create a new meal plan', async () => {
      const createDto = {
        name: 'Test Weight Loss Plan',
        durationInDays: 30,
      };

      const response = await httpRequest
        .post('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty(
        'name',
        'Test Weight Loss Plan',
      );
      expect(response.body.data).toHaveProperty('durationInDays', 30);
      expect(response.body.data).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.post('/meal-plans').expect(401);
    });
  });

  describe('GET /meal-plans', () => {
    it('should return user meal plans only (requires authentication)', async () => {
      // First create a meal plan
      const createDto = {
        name: 'My Weight Loss Plan',
        durationInDays: 14,
      };

      await httpRequest
        .post('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const response = await httpRequest
        .get('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get('/meal-plans').expect(401);
    });
  });

  describe('GET /meal-plans/user', () => {
    it('should return user meal plans', async () => {
      // First create a meal plan
      const createDto = {
        name: 'My Personal Weight Loss Plan',
        durationInDays: 60,
      };

      await httpRequest
        .post('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const response = await httpRequest
        .get('/meal-plans/user')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get('/meal-plans/user').expect(401);
    });
  });

  describe('GET /meal-plans/:id', () => {
    it('should return a meal plan by ID (owner only)', async () => {
      // First create a meal plan
      const createDto = {
        name: 'Weight Loss Plan for GET test',
        durationInDays: 90,
      };

      const createResponse = await httpRequest
        .post('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const id = createResponse.body.data.id as string;

      const response = await httpRequest
        .get(`/meal-plans/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', id);
      expect(response.body.data).toHaveProperty(
        'name',
        'Weight Loss Plan for GET test',
      );
      expect(response.body.data).toHaveProperty('userId', user.id);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get(`/meal-plans/${nonExistentId}`).expect(401);
    });

    it('should return 404 for non-existent ID', async () => {
      await httpRequest
        .get(`/meal-plans/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /meal-plans/:id', () => {
    it('should update a meal plan', async () => {
      // First create a meal plan
      const createDto = {
        name: 'Weight Loss Plan for PATCH test',
        durationInDays: 45,
      };

      const createResponse = await httpRequest
        .post('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const id = createResponse.body.data.id as string;

      const updateDto = {
        name: 'Updated Weight Loss Plan',
        durationInDays: 60,
      };

      await httpRequest
        .patch(`/meal-plans/${id}`)
        .set('Cookie', `token=${authToken}`)
        .send(updateDto)
        .expect(200);

      // Verify the update
      const response = await httpRequest
        .get(`/meal-plans/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty(
        'name',
        'Updated Weight Loss Plan',
      );
      expect(response.body.data).toHaveProperty('durationInDays', 60);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest
        .patch('/meal-plans/some-id')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should return 404 for non-existent ID', async () => {
      await httpRequest
        .patch(`/meal-plans/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });
  });

  describe('DELETE /meal-plans/:id', () => {
    it('should delete a meal plan', async () => {
      // First create a meal plan
      const createDto = {
        name: 'Weight Loss Plan for DELETE test',
        durationInDays: 30,
      };

      const createResponse = await httpRequest
        .post('/meal-plans')
        .set('Cookie', `token=${authToken}`)
        .send(createDto);

      const id = createResponse.body.data.id as string;

      // Delete it
      await httpRequest
        .delete(`/meal-plans/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      // Verify it's deleted
      await httpRequest
        .get(`/meal-plans/${id}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.delete('/meal-plans/some-id').expect(401);
    });

    it('should return 404 for non-existent ID', async () => {
      await httpRequest
        .delete(`/meal-plans/${nonExistentId}`)
        .set('Cookie', `token=${authToken}`)
        .expect(404);
    });
  });
});
