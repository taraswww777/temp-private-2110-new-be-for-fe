import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';
import { idColumnPrimary } from './base.schema.ts';

/**
 * Справочник филиалов
 */
export const branches = pgTable('branches', {
  id: idColumnPrimary(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
