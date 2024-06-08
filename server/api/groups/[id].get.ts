import { number, object } from 'zod'

export default defineEventHandler(async (event) => {

  // Get group id from route query
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Verify if this user ve access to this group
  await requireUserGroupAccess(event, [params.id])

  // SQL request
  const group = await useDrizzle()
    .select()
    .from(tables.groups)
    .where(eq(tables.groups.id, params.id))
    .get()

  return group
})