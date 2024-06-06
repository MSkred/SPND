export default defineEventHandler(async (event) => {
  // TODO: Move this route in groups folder and rename it /api/groups/byUser/${userId}
  
  // Get user id params from route
  const { id } = getRouterParams(event)

  // SQL request
  const groups = await useDrizzle()
    .select(tables.groups)
    .from(tables.groups)
    .innerJoin(tables.usersToGroups, eq(tables.groups.id, tables.usersToGroups.groupId))
    .where(eq(tables.usersToGroups.userId, id))

  // TODO: Update userSessions.groupIds with all groupIds
  return groups
})