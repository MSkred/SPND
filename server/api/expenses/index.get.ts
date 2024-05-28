export default defineEventHandler(async (event) => {

  // Get data from route query
  const { groupId, q, tagIds, categoryIds, boardIds, sort, order } = getQuery(event) as { groupId: number, q?: string, tagIds?: String[], categoryIds?: String[],  boardIds?: String[], sort: 'name' | 'price' | 'startDate', order: 'asc' | 'desc'};
  

  // SQL request
  let expenses = await useDrizzle()
    .select()
    .from(tables.expenses)
    .where(eq(tables.expenses.groupId, groupId))

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
  }).sort((a, b) => {
    if (!sort) return 0

    const aValue = a[sort]
    const bValue = b[sort]

    if (aValue < bValue) return order === 'asc' ? -1 : 1
    if (aValue > bValue) return order === 'asc' ? 1 : -1
    return 0
  })
})