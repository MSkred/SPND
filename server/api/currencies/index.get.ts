export default defineEventHandler(async (event) => {
  /** 
   * Get params from the call api query
   * for get currencies by
   * @param groupId 
   * @param boardId
  */
  const { groupId, boardId } = getQuery(event);

  // Select all currencies from currency table
  let currencies = await useDrizzle().select({
    id: tables.currencies.id,
    isoCode: tables.currencies.isoCode,
    symbol: tables.currencies.symbol,
    name: tables.currencies.name,
  }).from(tables.currencies)

  // Check if groupId & boardId parameters are there
  if (groupId && boardId) {
    // TODO: verify if user is in the category's group
    // TODO: verify if user is in the board's group
    // Select board by boardId
    const b = await useDrizzle().select().from(tables.boards).where(eq(tables.boards.id, boardId)).get()
    
    // Select group by groupId
    const g = await useDrizzle().select().from(tables.groups).where(eq(tables.groups.id, groupId)).get()
    
    // Fitler all currencies where currency_id 
    // is the linked currency in selected group and board
    currencies = currencies.filter(el => (el.id === b!.currencyId || el.id === g!.currencyId))

    // Return filtered currencies
    return currencies
  } else {

    // Return all currencies
    return currencies
  }
  
})