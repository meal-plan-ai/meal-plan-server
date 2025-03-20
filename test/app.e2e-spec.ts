import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
    } catch (error) {
      console.error('Test setup failed:', error);
      throw new Error('Test setup failed');
    }
  });

  it('/ (GET)', () => {
    const httpServer = app.getHttpServer();
    return supertest(httpServer).get('/').expect(200).expect('Hello World!');
  });
});
