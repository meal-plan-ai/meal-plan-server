import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { createTestingApp, resetDatabase } from '../../../test/test-utils';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import '../../../src/types/http-server'; // Import type augmentation

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let httpRequest: ReturnType<typeof supertest>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    try {
      app = await createTestingApp();
      userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      httpRequest = supertest(app.getHttpServer());
    } catch (error) {
      console.error('Failed to set up UsersController tests:', error);
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
      const response = await httpRequest.post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      if (response.headers['set-cookie']) {
        const cookies = response.headers['set-cookie'] as unknown as string[];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        if (tokenCookie) {
          authToken = tokenCookie.split(';')[0].replace('token=', '');
        } else {
          console.error('Token cookie not found in response');
        }
      } else {
        console.error('No cookies found in response headers');
        console.log('Full response headers:', response.headers);
      }
      const users = await userRepository.find();

      if (users.length > 0) {
        userId = users[0].id;
      } else {
        throw new Error('Failed to create test user');
      }
    } catch (error) {
      console.error('Error in test setup:', error);
      throw error;
    }
  });

  describe('GET /users/me', () => {
    it('should return the current user', async () => {
      const response = await httpRequest
        .get('/users/me')
        .set('Cookie', `token=${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 401 if not authenticated', async () => {
      await httpRequest.get('/users/me').expect(401);
    });
  });
});
