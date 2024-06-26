import { relations } from 'drizzle-orm';
import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

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
export const usersRelations = relations(users, ({ many }) => ({
  usersToGroups: many(usersToGroups),
}));
// TDM or Menage
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  private: integer('private', { mode: 'boolean' }).default(false),
  currencyId: integer('currency_id').notNull().references(() => currencies.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const groupsRelations = relations(groups, ({ many, one }) => ({
  usersToGroups: many(usersToGroups),
  currency: one(currencies, {
    fields: [groups.currencyId],
    references: [currencies.id]
  }),
  expenses: many(expenses),
  categories: many(categories),
  boards: many(boards),
  tags: many(tags),
}));
// 7-eleven 
export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  price: integer('price').notNull(),
  convertedPrice: integer('convertered_price').notNull(),
  expenseRate: integer('expense_rate').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  boardId: integer('board_id').notNull().references(() => boards.id),
  tagId: integer('tag_id').references(() => tags.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
  currencyId: integer('currency_id').notNull().references(() => currencies.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id]
  }),
  board: one(boards, {
    fields: [expenses.boardId],
    references: [boards.id]
  }),
  tag: one(tags, {
    fields: [expenses.tagId],
    references: [tags.id]
  }),
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id]
  }),
  currency: one(currencies, {
    fields: [expenses.currencyId],
    references: [currencies.id]
  }),
}));
// Alimentation
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  groupId: integer('group_id').notNull().references(() => groups.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const categoriesRelations = relations(categories, ({ many, one }) => ({
  expenses: many(expenses),
  group: one(groups, {
    fields: [categories.groupId],
    references: [groups.id]
  }),
}));
// Malaisie, Janvier 24
export const boards = sqliteTable('boards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon'),
  income: integer('income').default(0),
  objective: integer('objective').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  groupId: integer('group_id').notNull().references(() => groups.id),
  currencyId: integer('currency_id').notNull().references(() => currencies.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const boardsRelations = relations(boards, ({ many, one }) => ({
  expenses: many(expenses),
  group: one(groups, {
    fields: [boards.groupId],
    references: [groups.id]
  }),
  currency: one(currencies, {
    fields: [boards.currencyId],
    references: [currencies.id]
  }),
}));
// Kuala Lumpur
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon'),
  groupId: integer('group_id').notNull().references(() => groups.id),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const tagsRelations = relations(tags, ({ many, one }) => ({
  expenses: many(expenses),
  group: one(groups, {
    fields: [tags.groupId],
    references: [groups.id]
  }),
}));

// https://cdn.jsdelivr.net/gh/ismartcoding/currency-api@main/latest/data.json
export const currencies = sqliteTable('currencies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  isoCode: text('iso_code').unique().notNull(),
  symbol: text('symbol').notNull(),
  name: text('name'),
  rate: integer('rate').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text('updated_at').notNull().$defaultFn(() => sql`(CURRENT_TIMESTAMP)`).$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
})
export const currenciesRelations = relations(currencies, ({ many }) => ({
  groups: many(groups),
  expenses: many(expenses),
  boards: many(boards),
}));
export const usersToGroups = sqliteTable('usersToGroups', {
  userId: integer('user_id').notNull().references(() => users.id),
  groupId: integer('group_id').notNull().references(() => groups.id),
  permission: text('permission', { enum: ["ADMIN", "USER", "GUEST"] })
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.groupId] })
}));
export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersToGroups.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersToGroups.userId],
    references: [users.id],
  }),
}));