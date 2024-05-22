import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  google_id: text('google_id').notNull().unique(),
  firstname: text('firstname'),
  lastname: text('lastname'),
  picture: text('picture'),
  locale: text('locale').default('fr'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull()
})
