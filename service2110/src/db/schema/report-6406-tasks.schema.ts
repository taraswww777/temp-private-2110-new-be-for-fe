import { pgTable, uuid, timestamp, integer, varchar, date, bigint, text, index } from 'drizzle-orm/pg-core';

/**
 * Задания на построение отчёта для формы 6406
 */
export const report6406Tasks = pgTable('report_6406_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  
  // Информация о создателе
  createdBy: varchar('created_by', { length: 255 }),
  
  // Информация о филиале и периоде
  branchId: integer('branch_id').notNull(),
  branchName: varchar('branch_name', { length: 255 }).notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  
  // Фильтры для построения отчёта
  accountMask: varchar('account_mask', { length: 20 }),
  accountMaskSecondOrder: varchar('account_mask_second_order', { length: 2 }),
  currency: varchar('currency', { length: 20 }).notNull().$type<'RUB' | 'FOREIGN'>(),
  format: varchar('format', { length: 10 }).notNull().$type<'TXT' | 'XLSX' | 'XML'>(),
  reportType: varchar('report_type', { length: 10 }).notNull().$type<'LSOZ' | 'LSOS' | 'LSOP'>(),
  source: varchar('source', { length: 20 }),
  
  // Статус задания (21 статус)
  status: varchar('status', { length: 30 }).notNull().default('created'),
  
  // Информация о результате
  fileSize: bigint('file_size', { mode: 'number' }),
  filesCount: integer('files_count').notNull().default(0),
  fileUrl: text('file_url'),
  errorMessage: text('error_message'),
  
  // Временные метки
  lastStatusChangedAt: timestamp('last_status_changed_at').notNull().defaultNow(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index('idx_report_6406_tasks_created_at').on(table.createdAt.desc()),
  branchIdIdx: index('idx_report_6406_tasks_branch_id').on(table.branchId),
  statusIdx: index('idx_report_6406_tasks_status').on(table.status),
  periodStartIdx: index('idx_report_6406_tasks_period_start').on(table.periodStart),
  createdByIdx: index('idx_report_6406_tasks_created_by').on(table.createdBy),
  lastStatusChangedAtIdx: index('idx_report_6406_tasks_last_status_changed_at').on(table.lastStatusChangedAt.desc()),
}));

export type Report6406Task = typeof report6406Tasks.$inferSelect;
export type NewReport6406Task = typeof report6406Tasks.$inferInsert;

// Enum для валют
export enum Currency {
  RUB = 'RUB',
  FOREIGN = 'FOREIGN',
}

// Enum для форматов
export enum FileFormat {
  TXT = 'TXT',
  XLSX = 'XLSX',
  XML = 'XML',
}

// Enum для типов отчётов
export enum ReportType {
  LSOZ = 'LSOZ',
  LSOS = 'LSOS',
  LSOP = 'LSOP',
}

// Re-export TaskStatus from status-model
export { TaskStatus } from '../../types/status-model.js';
