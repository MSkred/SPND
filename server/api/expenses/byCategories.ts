import { inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {

  // Destructure query from the request
  let { groupId, tagIds, boardIds, categoryIds, sort, order } = getQuery(event) as { groupId: string, categoryIds?: String[], tagIds?: String[], boardIds?: String[], sort: 'key' | 'value', order: 'asc' | 'desc'};

  // Verify if this user ve access to the expense's group
  await requireUserGroupAccess(event, [parseInt(groupId)])

  if (boardIds?.length) { // Verify if boardIds query param is present
    
    if (typeof boardIds === 'string') { // Verify if the query param value is string
      boardIds = [boardIds] // Set the value in an array
    }
  } else {
    boardIds = [] // If not set the variable as an empty array
  }
  if (tagIds?.length) { // Verify if tagIds query param is present
    if (typeof tagIds === 'string') { // Verify if the query param value is string
      tagIds = [tagIds] // Set the value in an array
    }
  } else {
    tagIds = [] // If not set the variable as an empty array
  }
  if (categoryIds?.length) { // Verify if categoryIds query param is present
    if (typeof categoryIds === 'string') { // Verify if the query param value is string
      categoryIds = [categoryIds] // Set the value in an array
    }
  } else {
    categoryIds = [] // If not set the variable as an empty array
  }

  // Get all expenses grouped by category
  let expenses = await useDrizzle()
    .select({
      id: tables.categories.id,
      name: tables.categories.name,
      icon: tables.categories.icon,
      expensesPrice: sql<number>`sum(${tables.expenses.convertedPrice})`,
      symbol: tables.currencies.symbol,
    })
    .from(tables.expenses)
    .fullJoin(tables.categories, and(eq(tables.categories.id, tables.expenses.categoryId), eq(tables.categories.groupId, groupId)))
    .where(and(
      boardIds.length > 0 ? inArray(tables.expenses.boardId, boardIds) : undefined,
      tagIds.length > 0 ? inArray(tables.expenses.tagId, tagIds) : undefined,
      categoryIds.length > 0 ? inArray(tables.categories.id, categoryIds) : undefined,
    ))
    .innerJoin(tables.groups, eq(tables.groups.id, tables.categories.groupId))
    .innerJoin(tables.currencies, eq(tables.currencies.id, tables.groups.currencyId))
    .groupBy(tables.categories.id)
  
  // Sort sql response if sort param is present
  expenses.sort((a, b) => {
    if (!sort) return 0
    const aValue = a[sort]
    const bValue = b[sort]

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })

  // Return two objects, rows for the table and charts for the statistics
  return {
    rows: expenses,
    charts: expenses.map(el => { return { key: el.name, value: el.expensesPrice, icon: el.icon, symbol: el.symbol } })
  }
})