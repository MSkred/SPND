import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  
  // Get route params id
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Verify if this user ve access to this group
  await requireUserGroupAccess(event, [params.id])

  // Delete all row with this paramsId in usersToGroups table
  await useDrizzle().delete(tables.usersToGroups).where(
    eq(tables.usersToGroups.groupId, params.id)
  ).returning();

  // Delete the row with this paramsId in groups table
  await useDrizzle().delete(tables.groups).where(
    eq(tables.groups.id, params.id)
  ).returning();
  
  // TODO: remove this groupId from userSession
  return sendNoContent(event, 204)
})