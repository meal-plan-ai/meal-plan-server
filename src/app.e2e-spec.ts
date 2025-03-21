import { INestApplication } from '@nestjs/common';
import { createTestingApp } from '../test/test-utils';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    try {
      app = await createTestingApp();
    } catch (error) {
      console.error('Test setup failed:', error);
      throw error;
    }
  }, 30000);

  afterAll(async () => {
    await app?.close();
  }, 10000);

  it('app should be defined', () => {
    expect(app).toBeDefined();
  });
});
