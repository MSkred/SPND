
export default defineEventHandler(async (event) => {
  
  // Get group id from call api query
  const { groupId } = getQuery(event) as { groupId : string }

  // Verify if this user ve access to the board's group
  await requireUserGroupAccess(event, [parseInt(groupId)])
  
  // GET all boards by group_id
  const boards = await useDrizzle()
    .select()
    .from(tables.boards)
    .where(eq(tables.boards.groupId, groupId))

  return boards
})