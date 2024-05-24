import { drizzle } from 'drizzle-orm/d1'
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type User = typeof schema.users.$inferSelect
export type Groups = typeof schema.groups.$inferSelect
export type Boards = typeof schema.boards.$inferSelect
export type Categories = typeof schema.categories.$inferSelect
export type Tags = typeof schema.tags.$inferSelect
export type Expenses = typeof schema.expenses.$inferSelect
export type Currencies = typeof schema.currencies.$inferSelect