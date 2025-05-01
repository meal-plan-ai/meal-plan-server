// src/database/data-source.ts
import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Загружаем переменные окружения из .env файла
dotenv.config();

// При запуске миграций из командной строки нам нужно загрузить конфигурацию вручную
const configService = new ConfigService();

// Конфигурация, аналогичная той, что используется в database.module.ts
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL || configService.get('DATABASE_URL'),
  entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
  synchronize: false, // Отключаем автоматическую синхронизацию для миграций
};

// Создаем источник данных для TypeORM CLI
const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
