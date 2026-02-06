import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform(Number),
  HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TASKS_DIR: z.string().default('../docs/tasks'),
  // YouTrack настройки (опциональные)
  YOUTRACK_URL: z.string().url().optional(),
  YOUTRACK_TOKEN: z.string().optional(),
  YOUTRACK_PROJECT_ID: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
