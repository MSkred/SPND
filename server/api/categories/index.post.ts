import { object, string, number } from 'zod'
import RegExp from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the category's group 
  // TODO: verify if user have admin permission

  // Read and validate request body
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    // TODO: update regexp access
    icon: string().regex(RegExp().EmojiValidation, { message: 'Doit être un emoji' }),
    group_id: number({ coerce: true })
  }).parse)

  // Create category with data from body
  await useDrizzle().insert(tables.categories).values({
    name: body.name,
    icon: body.icon,
    groupId: body.group_id,
  }).execute()

  return sendNoContent(event, 201)
})