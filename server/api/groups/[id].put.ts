import { number, object, string } from 'zod'

export default defineEventHandler(async (event) => {
  
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)
  
  // Verify if this user ve access to this group
  await requireUserGroupAccess(event, [params.id])

  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    currency_id: number(),
  }).parse)

  await useDrizzle().update(tables.groups).set({
    name: body.name,
    currencyId: body.currency_id
  })
    .where(eq(tables.groups.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})