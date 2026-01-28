import { pgTable, uuid, timestamp, integer, varchar, date, bigint, text, index } from 'drizzle-orm/pg-core';

/**
 * Задания на построение отчёта для формы 6406
 */
export const report6406Tasks = pgTable('report_6406_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  branchId: integer('branch_id').notNull(),
  branchName: varchar('branch_name', { length: 255 }).notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),
  accountMask: varchar('account_mask', { length: 20 }),
  accountMaskSecondOrder: varchar('account_mask_second_order', { length: 2 }),
  currency: varchar('currency', { length: 20 }).notNull().$type<'RUB' | 'FOREIGN'>(),
  format: varchar('format', { length: 10 }).notNull().$type<'TXT' | 'XLSX' | 'XML'>(),
  reportType: varchar('report_type', { length: 10 }).notNull().$type<'LSOZ' | 'LSOS' | 'LSOP'>(),
  source: varchar('source', { length: 20 }),
  status: varchar('status', { length: 20 }).notNull().default('PENDING').$type<'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CANCELLED'>(),
  fileSize: bigint('file_size', { mode: 'number' }),
  fileUrl: text('file_url'),
  errorMessage: text('error_message'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index('idx_report_6406_tasks_created_at').on(table.createdAt.desc()),
  branchIdIdx: index('idx_report_6406_tasks_branch_id').on(table.branchId),
  statusIdx: index('idx_report_6406_tasks_status').on(table.status),
  periodStartIdx: index('idx_report_6406_tasks_period_start').on(table.periodStart),
}));

export type Report6406Task = typeof report6406Tasks.$inferSelect;
export type NewReport6406Task = typeof report6406Tasks.$inferInsert;

// Enum для статусов задания
export enum ReportTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

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
