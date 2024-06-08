export default defineEventHandler(async (event) => {
  
  // Get group id from call api query
  const { groupId } = getQuery(event) as { groupId : string }

  // Verify if this user ve access to the category's group
  await requireUserGroupAccess(event, [parseInt(groupId)])

  // Get all categories by group_id
  const categories = await useDrizzle()
    .select()
    .from(tables.categories)
    .where(eq(tables.categories.groupId, groupId))

  return categories
})