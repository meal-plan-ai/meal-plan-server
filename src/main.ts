import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptors/logging.interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3001;

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.use(cookieParser(process.env.JWT_SECRET || 'your-secret-key'));

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Meal Plan API')
    .setDescription('API documentation for Meal Plan application')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('profile', 'User profile endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
  });
}
bootstrap();
