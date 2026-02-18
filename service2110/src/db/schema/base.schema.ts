import { integer } from 'drizzle-orm/pg-core';

export const idColumnPrimary = (name: string = 'id') => integer(name).primaryKey().generatedAlwaysAsIdentity();

export const idColumn = (name: string) => integer(name).notNull();
