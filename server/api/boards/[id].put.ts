import { number, object, string } from 'zod'
import RegExp from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the board's group 
  // TODO: verify if user have admin permission

  // Get route parameters
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  // Read and validate request body
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    icon: string().regex(RegExp().EmojiValidation, { message: 'Doit être un emoji' }).nullish(),
    color: string().nullish(),
    currency_id: number(),
    income: number().nonnegative().nullish(),
    objective: number().nonnegative(),
    start_date: string(),
    end_date: string().nullish(),
  }).parse)

  // Update board table with body
  await useDrizzle().update(tables.boards).set({
    name: body.name,
    icon: body.icon,
    color: body.color,
    currencyId: body.currency_id,
    income: body.income,
    objective: body.objective,
    startDate: body.start_date,
    endDate: body.end_date,
  })
    .where(eq(tables.boards.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})