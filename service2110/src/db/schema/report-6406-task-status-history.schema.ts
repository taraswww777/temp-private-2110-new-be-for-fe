import { pgTable, uuid, timestamp, varchar, text, jsonb, index } from 'drizzle-orm/pg-core';
import { report6406Tasks } from './report-6406-tasks.schema.ts';

/**
 * История изменений статусов заданий отчётов формы 6406
 */
export const report6406TaskStatusHistory = pgTable('report_6406_task_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Связь с заданием
  taskId: uuid('task_id')
    .notNull()
    .references(() => report6406Tasks.id, { onDelete: 'cascade' }),
  
  // Информация о статусах
  status: varchar('status', { length: 30 }).notNull(),
  previousStatus: varchar('previous_status', { length: 30 }),
  
  // Информация об изменении
  changedAt: timestamp('changed_at').notNull().defaultNow(),
  changedBy: varchar('changed_by', { length: 255 }),
  comment: text('comment'),
  
  // Дополнительная информация (например, причина ошибки)
  metadata: jsonb('metadata'),
  
  // Время создания записи
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  taskIdIdx: index('idx_status_history_task_id').on(table.taskId),
  changedAtIdx: index('idx_status_history_changed_at').on(table.changedAt.desc()),
  statusIdx: index('idx_status_history_status').on(table.status),
}));

export type Report6406TaskStatusHistory = typeof report6406TaskStatusHistory.$inferSelect;
export type NewReport6406TaskStatusHistory = typeof report6406TaskStatusHistory.$inferInsert;
