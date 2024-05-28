import { sum } from 'drizzle-orm'
import { categories, currencies } from '~/server/database/schema';

export default defineEventHandler(async (event) => {

  // Get group id from route query
  const { groupId } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }


  const expenses = await useDrizzle()
    .select({
      id: tables.categories.id,
      groupId: tables.categories.groupId,
      name: tables.categories.name,
      icon: tables.categories.icon,
      color: tables.categories.color,
      expensesPrice: sum(tables.expenses.convertedPrice),
      symbol: tables.currencies.symbol
    })
    .from(tables.expenses)
    .innerJoin(tables.categories, eq(tables.categories.id, tables.expenses.categoryId))
    .innerJoin(tables.groups, eq(tables.groups.id, tables.categories.groupId))
    .innerJoin(tables.currencies, eq(tables.currencies.id, tables.groups.currencyId))
    .groupBy(tables.categories.id)
    .where(eq(tables.categories.groupId, groupId))
  
  return expenses
})