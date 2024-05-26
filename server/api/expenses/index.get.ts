export default defineEventHandler(async (event) => {

  // Get group id from route query
  const { group } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }

  // SQL request
  const expenses = await useDrizzle()
    .select()
    .from(tables.expenses)
    .where(eq(tables.expenses.groupId, group))

  return expenses
})