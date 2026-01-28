import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const items = pgTable('items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

// Экспорт схем для формы отчётности 6406
export * from './branches.schema';
export * from './sources.schema';
export * from './report-6406-tasks.schema';
export * from './report-6406-packages.schema';
export * from './report-6406-package-tasks.schema';
