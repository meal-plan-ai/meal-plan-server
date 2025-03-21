// Type declaration for NestJS HTTP server
// This helps with the TypeScript error: Unsafe argument of type `any` assigned to a parameter of type `App`
import { Server } from 'http';

// Declare module augmentation for INestApplication
declare module '@nestjs/common' {
  interface INestApplication {
    getHttpServer(): Server;
  }
}
