export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the board's group 

  // Get group id from call api query
  const { groupId } = getQuery(event);

  // GET all boards by group_id
  const boards = await useDrizzle()
    .select()
    .from(tables.boards)
    .where(eq(tables.boards.groupId, groupId))

  return boards
})