import { object, string, number, boolean, date } from 'zod'

export default defineEventHandler(async (event) => {

  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)


  // Verify body key types
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    price: number().positive(),
    startDate: string(),
    endDate: string().nullish(),
    currencyIsoCode: string(),
    category_id: number({ coerce: true }),
    board_id: number({ coerce: true }),
    tag_id: number({ coerce: true }).nullish(),
  }).parse)

  // Create category with data from body
  await useDrizzle().update(tables.expenses).set({
    name: body.name,
    price: body.price,
    startDate: body.startDate,
    endDate: body.endDate,
    currencyIsoCode: body.currencyIsoCode,
    categoryId: body.category_id,
    tagId: body.tag_id,
    boardId: body.board_id,
  })
    .where(eq(tables.expenses.id, params.id))
    .execute()

  return sendNoContent(event, 201)
})