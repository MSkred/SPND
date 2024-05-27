import { sum } from 'drizzle-orm'

export default defineEventHandler(async (event) => {

  // Get group id from route query
  const { group } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }


  const expenses = await useDrizzle()
    .select({
      expensesPrice: sum(tables.expenses.price),
      categories: tables.categories
    })
    .from(tables.expenses)
    .innerJoin(tables.categories, eq(tables.categories.id, tables.expenses.categoryId))
    .groupBy(tables.categories.id)
  
  return expenses
})