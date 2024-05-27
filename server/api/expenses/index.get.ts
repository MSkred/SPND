import { asc, desc } from 'drizzle-orm';

export default defineEventHandler(async (event) => {

  // Get data from route query
  const { groupId, q, tagIds, categoryIds, boardIds, sort, order } = getQuery(event) as { groupId: number, q?: string, tagIds?: String[], categoryIds?: String[],  boardIds?: String[], sort: 'name' | 'price' | 'startDate', order: 'asc' | 'desc'};
  
  let expenses;

  // Sort & Order
  if (order === 'asc') { // Order by ASC
    expenses = await useDrizzle()
      .select()
      .from(tables.expenses)
      .where(eq(tables.expenses.groupId, groupId))
      .orderBy(asc(tables.expenses[sort]));
  } else { // Order by DESC
    expenses = await useDrizzle()
      .select()
      .from(tables.expenses)
      .where(eq(tables.expenses.groupId, groupId))
      .orderBy(desc(tables.expenses[sort]));
  }

  // Filter
  return expenses.filter((expense) => { // Filter on query
    if (!q) return true
    return expense.name.search(new RegExp(q, 'i')) !== -1
  }).filter((expense) => { // Fitler on selected categories
    if (!categoryIds?.length) return true
    return categoryIds.includes(expense.categoryId.toString())
  }).filter((expense) => { // Filter on selected tags
    if (!tagIds?.length) return true
    if(!expense.tagId) return false
    return tagIds.includes(expense.tagId.toString())
  }).filter((expense) => { // Filter on selected boards
    if (!boardIds?.length) return true
    return boardIds.includes(expense.boardId.toString())
  })
})