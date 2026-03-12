import { index, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core';
import { idColumn, idColumnPrimary } from './base.schema.ts';
import { report6406Packages } from './report-6406-packages.schema.ts';
import { packetStatusPgEnum } from './enums.schema.ts';


/**
 * История изменений статусов пакетов отчётов формы 6406
 */
export const report6406PackageStatusHistory = pgTable('report_6406_package_status_history', {
  id: idColumnPrimary(),

  // Связь с пакетом
  packetId: idColumn('packet_id').references(() => report6406Packages.id, { onDelete: 'cascade' }),

  // Информация о статусах
  status: packetStatusPgEnum('status').notNull(),
  previousStatus: packetStatusPgEnum('previous_status'),

  // Информация об изменении
  changedAt: timestamp('changed_at').notNull().defaultNow(),
  changedBy: varchar('changed_by', { length: 255 }).notNull(),

  // Время создания записи
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  packetIdIdx: index('idx_package_status_history_packet_id').on(table.packetId),
  changedAtIdx: index('idx_package_status_history_changed_at').on(table.changedAt.desc()),
  statusIdx: index('idx_package_status_history_status').on(table.status),
}));

export type Report6406PackageStatusHistory = typeof report6406PackageStatusHistory.$inferSelect;
export type NewReport6406PackageStatusHistory = typeof report6406PackageStatusHistory.$inferInsert;
