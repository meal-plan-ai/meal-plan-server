import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { createTestingApp, resetDatabase } from '../../../test/test-utils';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import '../../../src/types/http-server';

describe('ProfileController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let httpRequest: ReturnType<typeof supertest>;
  let authToken: string;
  let user: User;

  beforeAll(async () => {
    try {
      app = await createTestingApp();
      userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      httpRequest = supertest(app.getHttpServer());
    } catch (error) {
      console.error('Failed to set up ProfileController tests:', error);
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

  describe('GET /profile', () => {
    it('should return the current user profile', async () => {
      const response = await httpRequest
        .get('/profile/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('userId', user.id);
      expect(response.body).toHaveProperty('firstName', 'Test');
      expect(response.body).toHaveProperty('lastName', 'User');
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get('/profile/me').expect(401);
    });
  });

  describe('PATCH /profile/:id', () => {
    it('should update the current user profile', async () => {
      const updateData = {
        id: user.profileId,
        firstName: 'Updated',
        lastName: 'Profile',
      };

      await httpRequest
        .patch(`/profile/${user.profileId}`)
        .set('Cookie', `token=${authToken}`)
        .send(updateData)
        .expect(200);

      const getResponse = await httpRequest
        .get('/profile/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('userId', user.id);
      expect(getResponse.body).toHaveProperty('firstName', 'Updated');
      expect(getResponse.body).toHaveProperty('lastName', 'Profile');
    });
  });
});
