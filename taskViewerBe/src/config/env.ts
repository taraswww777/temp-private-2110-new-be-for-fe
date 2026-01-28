import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TASKS_DIR: z.string().default('../docs/tasks'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
