import { object, string, number } from 'zod'

export default defineEventHandler(async (event) => {

  // Verify body key types
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    currency_id: number(),
    user_id: number()
  }).parse)

  // Create group with data from body
  const group = await useDrizzle().insert(tables.groups).values({
    name: body.name,
    currencyId: body.currency_id
  }).returning().get()

  // Check if group is created
  // If yes create relation between user
  if (group) {
    await useDrizzle().insert(tables.usersToGroups).values({
      userId: body.user_id,
      groupId: group.id
    }).returning();

    return sendNoContent(event, 201)
  }
})