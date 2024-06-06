export default defineEventHandler(async (event) => {
  // TODO: verify if user is in the category's group 

  // Get group id from call api query
  const { groupId } = getQuery(event);

  // Get all categories by group_id
  const categories = await useDrizzle()
    .select()
    .from(tables.categories)
    .where(eq(tables.categories.groupId, groupId))

  return categories
})