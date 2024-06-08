export default defineEventHandler(async (event) => {
  // Get user id params from route
  const { userId } = getRouterParams(event)
  
  // SQL request
  const groups = await useDrizzle()
    .select(tables.groups)
    .from(tables.groups)
    .innerJoin(tables.usersToGroups, eq(tables.groups.id, tables.usersToGroups.groupId))
    .where(eq(tables.usersToGroups.userId, userId))

  // Update userSession with getting group from database
  const groupIds = groups.map(el => el.id)
  let userSession = await getUserSession(event);
  userSession.user.groupIds = groupIds;
  await replaceUserSession(event, userSession)
  
  return groups
})