import { number, object, string } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 
  
  // Get route params id
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Delete all row with this paramsId in usersToGroups table
  await useDrizzle().delete(tables.usersToGroups).where(
    eq(tables.usersToGroups.groupId, params.id)
  ).returning();

  // Delete the row with this paramsId in groups table
  await useDrizzle().delete(tables.groups).where(
    eq(tables.groups.id, params.id)
  ).returning();
  
  return sendNoContent(event, 204)
})