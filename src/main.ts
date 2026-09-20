import { NestFactory } from '@nestjs/core';
import { setupSwagger } from './config/swagger.config.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupSwagger(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
