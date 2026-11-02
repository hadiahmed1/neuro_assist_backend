import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().min(5),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_ACCESS_TTL_SECONDS: z.coerce.number().int().positive().default(900),
    REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(14),
});

export type Env = z.infer<typeof envSchema>;