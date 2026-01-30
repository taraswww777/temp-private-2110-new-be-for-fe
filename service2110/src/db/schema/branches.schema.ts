import { pgTable, integer, varchar } from 'drizzle-orm/pg-core';

/**
 * Справочник филиалов
 */
export const branches = pgTable('branches', {
  id: varchar('id', { length: 50 }).primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
