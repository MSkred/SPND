import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  googleId: text('google_id').notNull().unique(),
  firstname: text('firstname'),
  lastname: text('lastname'),
  picture: text('picture'),
  locale: text('locale').default('fr'),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
// TDM or Menage
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  private: integer('private', { mode: 'boolean' }).default(false),
  currencyIsoCode: text('currency_iso_code').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
// 7-eleven 
export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  startDate: text('startDate').notNull(),
  endDate: text('endDate'),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  boardId: integer('board_id').notNull().references(() => boards.id),
  tagId: integer('tag_id').references(() => tags.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
  currencyIsoCode: text('currency_iso_code').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
// Alimentation
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  groupId: integer('group_id').notNull().references(() => groups.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
// Malaisie, Janvier 24
export const boards = sqliteTable('boards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  income: integer('income'),
  objective: integer('objective').notNull(),
  startDate: text('startDate').notNull(),
  endDate: text('endDate'),
  today: integer('today', { mode: 'boolean' }),
  groupId: integer('group_id').notNull().references(() => groups.id),
  currencyIsoCode: text('currency_iso_code').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
// Kuala Lumpur
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon'),
  color: text('color'),
  groupId: integer('group_id').notNull().references(() => groups.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})

// https://cdn.jsdelivr.net/gh/ismartcoding/currency-api@main/latest/data.json
export const currencies = sqliteTable('currencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isoCode: text('iso_code').unique().notNull(),
  symbol: text('symbol').notNull(),
  name: text('name'),
  rate: integer('rate'),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const usersToGroups = sqliteTable('usersToGroups', {
  userId: integer('user_id').notNull().references(() => users.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
});