import { drizzle } from 'drizzle-orm/d1'
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type User = typeof schema.users.$inferSelect
export type Group = typeof schema.groups.$inferSelect
export type Board = typeof schema.boards.$inferSelect
export type Category = typeof schema.categories.$inferSelect
export type Tag = typeof schema.tags.$inferSelect
export type Expense = typeof schema.expenses.$inferSelect
export type Currency = typeof schema.currencies.$inferSelect