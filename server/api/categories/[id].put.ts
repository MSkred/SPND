import { number, object, string } from 'zod'
import EmojiValidation from "~/utils/regexp";

export default defineEventHandler(async (event) => {
  // TODO: verify if user have admin permission
  
  // Get id params from route api
  const params = await getValidatedRouterParams(event, object({
    id: number({ coerce: true }),
  }).parse,)
  
  // Read and validate body from the request
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    icon: string().regex(EmojiValidation, { message: 'Doit être un emoji' })
  }).parse)

  const category = await useDrizzle().select({ groupId: tables.categories.groupId }).from(tables.categories).where(eq(tables.categories.id, params.id))
  const groupIds = category.map(el => el.groupId)

  // Verify if this user ve access to the category's group
  await requireUserGroupAccess(event, groupIds)

  // Update row by id in the category table
  await useDrizzle().update(tables.categories).set({
    name: body.name,
    icon: body.icon
  })
    .where(eq(tables.categories.id, params.id))
    .execute()

  return sendNoContent(event, 204)
})