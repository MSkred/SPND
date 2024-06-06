import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the expense's group 
  // TODO: verify if user have admin permission

  // Get id from path parameter
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Delete the row with this paramsId in expenses table
  await useDrizzle().delete(tables.expenses).where(
    eq(tables.expenses.id, params.id)
  ).returning();

  return sendNoContent(event, 204)
})