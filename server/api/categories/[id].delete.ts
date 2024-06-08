import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO: verify if user have admin permission
  
  // Get route params id
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)


  const category = await useDrizzle().select({ groupId: tables.categories.groupId }).from(tables.categories).where(eq(tables.categories.id, params.id))
  const groupIds = category.map(el => el.groupId)

  // Verify if this user ve access to the category's group
  await requireUserGroupAccess(event, groupIds)

  // Delete the row with this paramsId in categories table
  await useDrizzle().delete(tables.categories).where(
    eq(tables.categories.id, params.id)
  ).returning();
  
  return sendNoContent(event, 204)
})