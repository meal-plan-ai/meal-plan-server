import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { createTestingApp, resetDatabase } from '../../../test/test-utils';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import '../../../src/types/http-server'; // Import type augmentation

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let request: ReturnType<typeof supertest>;

  beforeAll(async () => {
    try {
      app = await createTestingApp();
      userRepository = app.get<Repository<User>>(getRepositoryToken(User));
      request = supertest(app.getHttpServer());
    } catch (error) {
      console.error('Failed to set up AuthController tests:', error);
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
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      const response = await request
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body.success).toBeTruthy();

      // Check that cookie was set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=');

      // Verify user was created in the database
      const users = await userRepository.find();
      expect(users.length).toBe(1);
      expect(users[0].email).toBe(registerData.email);
    });

    it('should return 400 if email already exists', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      // First registration
      await request.post('/auth/register').send(registerData);

      // Try to register with the same email
      await request.post('/auth/register').send(registerData).expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login an existing user', async () => {
      // Register a user first
      const userData = {
        email: 'login@example.com',
        password: 'Password123!',
        firstName: 'Login',
        lastName: 'Test',
      };

      await request.post('/auth/register').send(userData);

      // Login with the registered user
      const loginResponse = await request
        .post('/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(201);

      expect(loginResponse.body.success).toBeTruthy();
      expect(loginResponse.headers['set-cookie']).toBeDefined();
      expect(loginResponse.headers['set-cookie'][0]).toContain('token=');
    });

    it('should return 401 for invalid credentials', async () => {
      await request
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should clear the token cookie', async () => {
      const response = await request.post('/auth/logout').expect(201);

      expect(response.body.success).toBeTruthy();
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toContain('token=;');
      expect(response.headers['set-cookie'][0]).toContain('Expires=');
    });
  });
});
