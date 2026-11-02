import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './config/swagger.config.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // silently strips unknown properties
      forbidNonWhitelisted: true, // rejects requests containing unknown properties instead
      transform: true, // deserializes payloads into DTO class instances
    }),
  );
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
