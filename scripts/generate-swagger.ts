import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import * as fs from 'fs';

async function generateSwagger() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Meal Plan API')
    .setDescription('Meal Plan API documentation')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  console.log('Swagger JSON has been generated successfully!');
  await app.close();
}

generateSwagger().catch(err => {
  console.error('Error generating Swagger documentation:', err);
  process.exit(1);
});