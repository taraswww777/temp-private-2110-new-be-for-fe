import { pgTable, uuid, timestamp, varchar, integer, bigint, index } from 'drizzle-orm/pg-core';

/**
 * Пакеты заданий для формы 6406
 */
export const report6406Packages = pgTable('report_6406_packages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  createdBy: varchar('created_by', { length: 255 }).notNull(),
  lastCopiedToTfrAt: timestamp('last_copied_to_tfr_at'),
  tasksCount: integer('tasks_count').notNull().default(0),
  /**
   * Общий размер пакета в байтах (сумма размеров всех файлов).
   * По умолчанию 0 (пустой пакет).
   */
  totalSize: bigint('total_size', { mode: 'number' }).notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index('idx_report_6406_packages_created_at').on(table.createdAt.desc()),
  nameIdx: index('idx_report_6406_packages_name').on(table.name),
}));

export type Report6406Package = typeof report6406Packages.$inferSelect;
export type NewReport6406Package = typeof report6406Packages.$inferInsert;
