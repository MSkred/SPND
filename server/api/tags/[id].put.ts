import { number, object, string } from 'zod'
import EmojiValidation from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO verify if user is in the group 
  
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)
  
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    icon: string().regex(EmojiValidation, { message: 'Doit être un emoji' }).nullish(),
  }).parse)

  await useDrizzle().update(tables.tags).set({
    name: body.name,
    icon: body.icon,
  })
    .where(eq(tables.tags.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})