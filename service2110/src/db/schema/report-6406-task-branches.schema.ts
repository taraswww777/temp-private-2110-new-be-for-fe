import { pgTable, uuid, timestamp, primaryKey, index } from 'drizzle-orm/pg-core';
import { report6406Tasks } from './report-6406-tasks.schema.ts';
import { branches } from './branches.schema.ts';
import { idColumn } from './base.schema.ts';

/**
 * Связующая таблица many-to-many между заданиями и филиалами
 */
export const report6406TaskBranches = pgTable('report_6406_task_branches', {
  taskId: idColumn('task_id').references(() => report6406Tasks.id, { onDelete: 'cascade' }),
  branchId: idColumn('branch_id').references(() => branches.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.taskId, table.branchId] }),
  taskIdIdx: index('idx_report_6406_task_branches_task_id').on(table.taskId),
  branchIdIdx: index('idx_report_6406_task_branches_branch_id').on(table.branchId),
}));

export type Report6406TaskBranch = typeof report6406TaskBranches.$inferSelect;
export type NewReport6406TaskBranch = typeof report6406TaskBranches.$inferInsert;
