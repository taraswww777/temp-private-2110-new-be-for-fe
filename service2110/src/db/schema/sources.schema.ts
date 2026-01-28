import { pgTable, varchar } from 'drizzle-orm/pg-core';

/**
 * Справочник источников счетов
 */
export const sources = pgTable('sources', {
  code: varchar('code', { length: 20 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  ris: varchar('ris', { length: 20 }),
});

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;
