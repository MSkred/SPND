export default defineEventHandler(async (event) => {

  // Get group id from route query
  const { group } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }

  // SQL request
  const categories = await useDrizzle()
    .select()
    .from(tables.categories)
    .where(eq(tables.categories.groupId, group))

  return categories
})