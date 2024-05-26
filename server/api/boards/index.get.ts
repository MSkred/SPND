export default defineEventHandler(async (event) => {

  // Get group id from route query
  const { group } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }

  // SQL request
  const boards = await useDrizzle()
    .select()
    .from(tables.boards)
    .where(eq(tables.boards.groupId, group))

  return boards
})