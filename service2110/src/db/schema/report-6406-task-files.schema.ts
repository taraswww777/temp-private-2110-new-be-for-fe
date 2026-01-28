import { pgTable, uuid, timestamp, varchar, bigint, text, index } from 'drizzle-orm/pg-core';
import { report6406Tasks } from './report-6406-tasks.schema.js';

/**
 * Файлы отчётов формы 6406
 */
export const report6406TaskFiles = pgTable('report_6406_task_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Связь с заданием
  taskId: uuid('task_id')
    .notNull()
    .references(() => report6406Tasks.id, { onDelete: 'cascade' }),
  
  // Информация о файле
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSize: bigint('file_size', { mode: 'number' }).notNull(),
  fileType: varchar('file_type', { length: 100 }).notNull(),
  
  // Статус конвертации файла
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  
  // URL файлов
  storageUrl: text('storage_url').notNull(),
  downloadUrl: text('download_url'),
  downloadUrlExpiresAt: timestamp('download_url_expires_at'),
  
  // Информация об ошибке
  errorMessage: text('error_message'),
  
  // Временные метки
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  taskIdIdx: index('idx_task_files_task_id').on(table.taskId),
  statusIdx: index('idx_task_files_status').on(table.status),
  createdAtIdx: index('idx_task_files_created_at').on(table.createdAt.desc()),
}));

export type Report6406TaskFile = typeof report6406TaskFiles.$inferSelect;
export type NewReport6406TaskFile = typeof report6406TaskFiles.$inferInsert;
