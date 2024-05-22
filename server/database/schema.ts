import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  googleId: text('google_id').notNull().unique(),
  firstname: text('firstname'),
  lastname: text('lastname'),
  picture: text('picture'),
  locale: text('locale').default('fr'),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(current_timestamp)`).$onUpdateFn(() => sql`(current_timestamp)`),
})

export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  private: integer('private', { mode: 'boolean' }).default(false),
  income: integer('income'),
  objective: integer('objective').notNull(),
  startDate: integer('createdAt', { mode: 'timestamp_ms' }),
  endDate: integer('createdAt', { mode: 'timestamp_ms' }),
  today: integer('today', { mode: 'boolean' }),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(current_timestamp)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(current_timestamp)`).$onUpdateFn(() => sql`(current_timestamp)`),
})

export const usersToGroups = sqliteTable('usersToGroups', {
  userId: integer('user_id').notNull().references(() => users.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
});