import { inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {

  // Get data from route query
  let { groupId, tagIds, boardIds, categoryIds, sort, order } = getQuery(event) as { groupId: number, categoryIds?: String[], tagIds?: String[], boardIds?: String[], sort: 'key' | 'value', order: 'asc' | 'desc'};

  if (boardIds?.length) {
    if (typeof boardIds === 'string') {
      boardIds = [boardIds]
    }
  } else {
    boardIds = []
  }

  if (tagIds?.length) {
    if (typeof tagIds === 'string') {
      tagIds = [tagIds]
    }
  } else {
    tagIds = []
  }
  if (categoryIds?.length) {
    if (typeof categoryIds === 'string') {
      categoryIds = [categoryIds]
    }
  } else {
    categoryIds = []
  }

  // SQL request
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
  
  // Filter
  expenses.sort((a, b) => {
    if (!sort) return 0
    const aValue = a[sort]
    const bValue = b[sort]

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })

  return {
    rows: expenses,
    charts: expenses.map(el => { return { key: el.name, value: el.expensesPrice, icon: el.icon, symbol: el.symbol } })
  }
})