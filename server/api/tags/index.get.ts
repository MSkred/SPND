export default defineEventHandler(async (event) => {

  // Get group id from route query
  const { group } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }

  // SQL request
  const tags = await useDrizzle()
    .select()
    .from(tables.tags)
    .where(eq(tables.tags.groupId, group))

  return tags
})