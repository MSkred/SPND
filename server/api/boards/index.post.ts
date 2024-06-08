import { object, string, number } from 'zod'
import EmojiValidation from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO: verify if user have admin permission

  // Read and validate body 
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    icon: string().regex(EmojiValidation, { message: 'Doit être un emoji' }).nullish(),
    currency_id: number({ coerce: true }),
    income: number().nonnegative().nullish(),
    objective: number().nonnegative(),
    start_date: string(),
    end_date: string().nullish(),
    group_id: number({ coerce: true })
  }).parse)

  // Verify if this user ve access to the group_id from body
  await requireUserGroupAccess(event, [body.group_id])

  // Create board with data from body
  await useDrizzle().insert(tables.boards).values({
    name: body.name,
    icon: body.icon,
    currencyId: body.currency_id,
    income: body.income,
    objective: body.objective,
    startDate: body.start_date,
    endDate: body.end_date,
    groupId: body.group_id,
  }).execute()

  return sendNoContent(event, 201)
})