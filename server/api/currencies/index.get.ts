import _ from "lodash"

export default defineEventHandler(async (event) => {
  /** 
   * Get params from the call api query
   * for get currencies by
   * @param groupId 
   * @param boardId
  */
  
  const { groupId, boardId } = getQuery(event) as { groupId: string, boardId: string }

  // Select all currencies from currency table
  let currencies = await useDrizzle().select({
    id: tables.currencies.id,
    isoCode: tables.currencies.isoCode,
    symbol: tables.currencies.symbol,
    name: tables.currencies.name,
  }).from(tables.currencies)

  // Check if groupId & boardId parameters are there
  if (groupId && boardId) {
    // Select board by boardId
    const b = await useDrizzle().select().from(tables.boards).where(eq(tables.boards.id, boardId)).get()
    
    // Select group by groupId
    const g = await useDrizzle().select().from(tables.groups).where(eq(tables.groups.id, groupId)).get()

    const groupIds = _.union([g!.id], [b!.groupId]) // Merge different value from group.id and board.groupId as an array of number

    // Verify if this user ve access to this group
    await requireUserGroupAccess(event, groupIds)

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