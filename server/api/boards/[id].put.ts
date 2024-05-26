import { number, object, string, boolean } from 'zod'
import RegExp from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 

  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)

  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    icon: string().regex(RegExp().EmojiValidation, { message: 'Doit être un emoji' }).nullish(),
    color: string().nullish(),
    currencyIsoCode: string(),
    income: number().positive().nullish(),
    objective: number().positive(),
    startDate: string(),
    endDate: string().nullish(),
    today: boolean().default(false),
  }).parse)

  await useDrizzle().update(tables.boards).set({
    name: body.name,
    icon: body.icon,
    color: body.color,
    currencyIsoCode: body.currencyIsoCode,
    income: body.income,
    objective: body.objective,
    startDate: body.startDate,
    endDate: body.endDate,
    today: body.today,
  })
    .where(eq(tables.boards.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})