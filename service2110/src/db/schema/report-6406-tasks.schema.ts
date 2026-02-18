import { bigint, date, index, integer, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { branches } from './branches.schema.ts';
import { ReportTypeEnum } from '../../schemas/enums/ReportTypeEnum';
import { FileFormat } from '../../schemas/enums/FileFormatEnum';
import { Currency } from '../../schemas/enums/CurrencyEnum';
import { idColumn, idColumnPrimary } from './base.schema.ts';

/**
 * PostgreSQL enum для типа отчёта
 * Создаётся на основе TypeScript enum ReportTypeEnum
 */
export const reportTypePgEnum = pgEnum('report_type_enum', [
  ReportTypeEnum.LSOZ,
  ReportTypeEnum.LSOS,
  ReportTypeEnum.LSOP,
  ReportTypeEnum.KROS_VOS,
  ReportTypeEnum.KROS_VZS,
  ReportTypeEnum.KROS,
]);


export const fileFormatPgEnum = pgEnum('file_format_enum', [
  FileFormat.TXT,
  FileFormat.XLSX,
  FileFormat.XML,
]);

export const currencyPgEnum = pgEnum('currency_enum', [
  Currency.RUB,
  Currency.FOREIGN
]);

/**
 * Задания на построение отчёта для формы 6406
 */
export const report6406Tasks = pgTable('report_6406_tasks', {
  id: idColumnPrimary(),
  createdAt: timestamp('created_at').notNull().defaultNow(),

  // Информация о создателе
  createdBy: varchar('created_by', { length: 255 }),

  // Информация о филиале и периоде
  branchId: idColumn('branch_id').references(() => branches.id),
  branchName: varchar('branch_name', { length: 255 }).notNull(),
  periodStart: date('period_start').notNull(),
  periodEnd: date('period_end').notNull(),

  // Фильтры для построения отчёта
  accountMask: varchar('account_mask', { length: 20 }),
  accountSecondOrder: varchar('account_second_order', { length: 2 }),
  currency: currencyPgEnum('currency').notNull(),
  format: fileFormatPgEnum('format').notNull(),
  reportType: reportTypePgEnum('report_type').notNull(),
  source: varchar('source', { length: 20 }),

  // Статус задания (21 статус)
  status: varchar('status', { length: 30 }).notNull().default('created'),

  // Информация о результате
  /**
   * Размер файла в байтах.
   * Может быть NULL если размер ещё не известен (задание не завершено).
   */
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


// Re-export TaskStatus from status-model
export { TaskStatus } from '../../types/status-model.ts';
