import { object, string, number, boolean, date } from 'zod'
import RegExp from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  console.log('event is ', event);
  // Verify body key types
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
    group_id: number({ coerce: true })
  }).parse)

  // Create category with data from body
  await useDrizzle().insert(tables.boards).values({
    name: body.name,
    icon: body.icon,
    color: body.color,
    currencyIsoCode: body.currencyIsoCode,
    income: body.income,
    objective: body.objective,
    startDate: body.startDate,
    endDate: body.endDate,
    today: body.today,
    groupId: body.group_id,
  }).execute()

  return sendNoContent(event, 201)
})