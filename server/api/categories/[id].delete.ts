import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the category's group 
  // TODO: verify if user have admin permission
  
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