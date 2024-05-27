import { number, object, string } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 
  
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)
  
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