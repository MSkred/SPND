import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 

  // Get route params id
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Delete the row with this paramsId in expenses table
  await useDrizzle().delete(tables.expenses).where(
    eq(tables.expenses.id, params.id)
  ).returning();

  return sendNoContent(event, 204)
})