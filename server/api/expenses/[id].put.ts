import { object, string, number } from 'zod'

export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the expense's group 
  // TODO: verify if user have admin permission

  // Get id parameter from path
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)


  // Read and validate data from request body
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    price: number().positive(),
    startDate: string(),
    endDate: string().nullish(),
    currency_id: number({ coerce: true }),
    category_id: number({ coerce: true }),
    board_id: number({ coerce: true }),
    tag_id: number({ coerce: true }).nullish(),
  }).parse)

  // Update category by categoryId with data from body
  await useDrizzle().update(tables.expenses).set({
    name: body.name,
    price: body.price,
    startDate: body.startDate,
    endDate: body.endDate,
    currencyId: body.currency_id,
    categoryId: body.category_id,
    tagId: body.tag_id,
    boardId: body.board_id,
  })
    .where(eq(tables.expenses.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})