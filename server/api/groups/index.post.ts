import { object, string, number } from 'zod'

export default defineEventHandler(async (event) => {

  // Verify body key types
  const body = await readValidatedBody(event, object({
    name: string(),
    currency_iso_code: string(),
    user_id: number()
  }).parse)

  // Create group with data from body
  const group = await useDrizzle().insert(tables.groups).values({
    name: body.name,
    currencyIsoCode: body.currency_iso_code
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