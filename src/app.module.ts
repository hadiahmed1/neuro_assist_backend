import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (env: Record<string, unknown>) => {
        if (!env.DATABASE_URL) throw new Error('DATABASE_URL is required');
        return env;
      },
    }),
    PrismaModule,
  ],
})
export class AppModule {}