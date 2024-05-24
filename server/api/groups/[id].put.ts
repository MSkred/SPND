import { number, object, string } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 
  
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,
  )
  const body = await readValidatedBody(event, object({
    name: string(),
    currency_iso_code: string(),
  }).parse)

  await useDrizzle().update(tables.groups).set({
    name: body.name,
    currencyIsoCode: body.currency_iso_code
  })
    .where(eq(tables.groups.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})