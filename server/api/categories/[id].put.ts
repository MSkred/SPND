import { number, object, string } from 'zod'
import RegExp from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the category's group 
  // TODO: verify if user have admin permission
  
  // Get id params from route api
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)
  
  // Read and validate body from the request
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    // TODO: update Regexp access 
    icon: string().regex(RegExp().EmojiValidation, { message: 'Doit être un emoji' })
  }).parse)

  // Update row by id in the category table
  await useDrizzle().update(tables.categories).set({
    name: body.name,
    icon: body.icon
  })
    .where(eq(tables.categories.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})