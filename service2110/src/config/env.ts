import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  HOST: z.string().default('0.0.0.0'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('5432').transform(Number),
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('postgres'),
  DB_NAME: z.string().default('app_db'),
  
  // Storage Configuration
  STORAGE_MAX_SIZE_BYTES: z.string().default('1099511627776').transform(Number), // 1TB по умолчанию
  STORAGE_WARNING_THRESHOLD: z.string().default('85').transform(Number), // Предупреждение при 85%
  
  // File URLs (Mock)
  MOCK_FILE_STORAGE_URL: z.string().default('http://localhost:3000/mock-files'),
  PRESIGNED_URL_EXPIRATION_HOURS: z.string().default('1').transform(Number), // Срок действия pre-signed URLs
  STORAGE_BUCKET_NAME: z.string().default('mock-reports-bucket'),
  
  // CSV Export
  CSV_EXPORT_MAX_RECORDS: z.string().default('10000').transform(Number), // Максимальное количество записей в CSV
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
