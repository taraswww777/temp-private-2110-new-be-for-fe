import { pgTable, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { report6406Packages } from './report-6406-packages.schema.ts';
import { report6406Tasks } from './report-6406-tasks.schema.ts';
import { idColumn } from './base.schema.ts';

/**
 * Связующая таблица many-to-many между пакетами и заданиями
 */
export const report6406PackageTasks = pgTable('report_6406_package_tasks', {
  packageId: idColumn('package_id').references(() => report6406Packages.id, { onDelete: 'cascade' }),
  taskId: idColumn('task_id').references(() => report6406Tasks.id, { onDelete: 'cascade' }),
  addedAt: timestamp('added_at').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.packageId, table.taskId] }),
  packageIdIdx: index('idx_report_6406_package_tasks_package_id').on(table.packageId),
  taskIdIdx: index('idx_report_6406_package_tasks_task_id').on(table.taskId),
}));

export type Report6406PackageTask = typeof report6406PackageTasks.$inferSelect;
export type NewReport6406PackageTask = typeof report6406PackageTasks.$inferInsert;
