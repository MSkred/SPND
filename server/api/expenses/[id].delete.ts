import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO: verify if user have admin permission

  // Get id from path parameter
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  const expense = await useDrizzle().select({ groupId: tables.expenses.groupId }).from(tables.expenses).where(eq(tables.expenses.id, params.id))
  const groupIds = expense.map(el => el.groupId)

  // Verify if this user ve access to the expense's group
  await requireUserGroupAccess(event, groupIds)
  
  // Delete the row with this paramsId in expenses table
  await useDrizzle().delete(tables.expenses).where(
    eq(tables.expenses.id, params.id)
  ).returning();

  return sendNoContent(event, 204)
})