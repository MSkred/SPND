export default defineEventHandler(async (event) => {

  // Get user id params from route
  const { id } = getRouterParams(event)

  // SQL request
  const groups = await useDrizzle()
    .select(tables.groups)
    .from(tables.groups)
    .innerJoin(tables.usersToGroups, eq(tables.groups.id, tables.usersToGroups.groupId))
    .where(eq(tables.usersToGroups.userId, id))

  return groups
})