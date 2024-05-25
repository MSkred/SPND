import { number, object, string } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 
  
  // Get route params id
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Delete the row with this paramsId in categories table
  await useDrizzle().delete(tables.categories).where(
    eq(tables.categories.id, params.id)
  ).returning();
  
  return sendNoContent(event, 204)
})