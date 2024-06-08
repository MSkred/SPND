import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  
  // Get current user session 
  let userSession = await getUserSession(event);

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
  
  // Remove group_id from user session
  const index = userSession.user.groupIds.indexOf(params.id);
  if (index > -1) { // only splice array when item is found
    userSession.user.groupIds.splice(index, 1); // 2nd parameter means remove one item only
    await replaceUserSession(event, userSession)
  }

  return sendNoContent(event, 204)
})