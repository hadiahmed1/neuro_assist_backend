import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module.js';
import { envSchema } from './config/env.schema.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (raw) => envSchema.parse(raw),
    }),
    PrismaModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Registering through the DI container keeps Reflector (decorators) fully functional.
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}