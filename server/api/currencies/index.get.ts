export default defineEventHandler(async (event) => {
  const { group, board } = getQuery(event); // { key: "value", key2: ["value1", "value2"] }

  let currencies = await useDrizzle().select({
    id: tables.currencies.id,
    isoCode: tables.currencies.isoCode,
    symbol: tables.currencies.symbol,
    name: tables.currencies.name,
  }).from(tables.currencies)

  if (group && board) {
    const b = await useDrizzle().select().from(tables.boards).where(and(
      eq(tables.boards.groupId, group),
      eq(tables.boards.id, board),
    )).get()
    
    const g = await useDrizzle().select().from(tables.groups).where(eq(tables.groups.id, group)).get()
    
    currencies = currencies.filter(el => (el.isoCode === b!.currencyIsoCode || el.isoCode === g!.currencyIsoCode))
    return currencies
  } else {
    return currencies
  }
  
})