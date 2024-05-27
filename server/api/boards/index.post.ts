import { object, string, number, boolean, date } from 'zod'
import RegExp from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // Verify body key types
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    icon: string().regex(RegExp().EmojiValidation, { message: 'Doit être un emoji' }).nullish(),
    color: string().nullish(),
    currency_id: number({ coerce: true }),
    income: number().positive().nullish(),
    objective: number().positive(),
    start_date: string(),
    end_date: string().nullish(),
    group_id: number({ coerce: true })
  }).parse)

  // Create category with data from body
  await useDrizzle().insert(tables.boards).values({
    name: body.name,
    icon: body.icon,
    color: body.color,
    currencyId: body.currency_id,
    income: body.income,
    objective: body.objective,
    startDate: body.start_date,
    endDate: body.end_date,
    groupId: body.group_id,
  }).execute()

  return sendNoContent(event, 201)
})