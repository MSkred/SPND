import { number, object } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO: verify if user have admin permission
  
  // Get route params id
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)


  const board = await useDrizzle().select({ groupId: tables.boards.groupId }).from(tables.boards).where(eq(tables.boards.id, params.id))
  const groupIds = board.map(el => el.groupId)

  // Verify if this user ve access to the board's group
  await requireUserGroupAccess(event, groupIds)

  // Delete the row with this paramsId in boards table
  await useDrizzle().delete(tables.boards).where(
    eq(tables.boards.id, params.id)
  ).returning();
  
  return sendNoContent(event, 204)
})