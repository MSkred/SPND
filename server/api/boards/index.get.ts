
export default defineEventHandler(async (event) => {
  // Verify if this user ve access to this group
  await requireUserGroupAccess(event)
  
  // Get group id from call api query
  const { groupId } = getQuery(event);

  // GET all boards by group_id
  const boards = await useDrizzle()
    .select()
    .from(tables.boards)
    .where(eq(tables.boards.groupId, groupId))

  return boards
})