export default defineEventHandler(async (event) => {
  const { groupId, boardId } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }

  let currencies = await useDrizzle().select({
    id: tables.currencies.id,
    isoCode: tables.currencies.isoCode,
    symbol: tables.currencies.symbol,
    name: tables.currencies.name,
  }).from(tables.currencies)

  if (groupId && boardId) {
    const b = await useDrizzle().select().from(tables.boards).where(and(
      eq(tables.boards.groupId, groupId),
      eq(tables.boards.id, boardId),
    )).get()
    
    const g = await useDrizzle().select().from(tables.groups).where(eq(tables.groups.id, groupId)).get()
    
    currencies = currencies.filter(el => (el.id === b!.currencyId || el.id === g!.currencyId))
    return currencies
  } else {
    return currencies
  }
  
})