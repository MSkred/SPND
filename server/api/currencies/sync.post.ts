import { Currency } from "~/server/utils/drizzle";
import { CurrencySyncApi, SymbolLocalJson } from "~/types";

export default defineEventHandler(async (event) => {

  // Get timestamp from call api query parameters
  // this timestamp is updateAt currency value
  let { ts } = getQuery(event) as { ts: number };

  // Get all currencies from sync API
  const data = await $fetch<CurrencySyncApi>('https://cdn.jsdelivr.net/gh/ismartcoding/currency-api@main/latest/data.json')

  // Get currencies information from local json
  const json = await $fetch<Array<SymbolLocalJson>>('/api/currencies/json')

  // Check if Database timestamp < sync API timestamp
  if (ts < (data.ts * 1000)) {
    // Loop in currencies from sync API
    for (const [key, value] of Object.entries(data.quotes)) {
      // Find same element by iso_code from local json
      const find = json.find(el => el.iso_code === key)

      if (find) {
        // Create currency object
        const values: Currency = {
          isoCode: key,
          rate: value,
          symbol: find.symbol,
          name: find.currency,
          createdAt: undefined,
          updatedAt: undefined
        }
        // Insert element and if find same element by isoCode update value
        await useDrizzle().insert(tables.currencies).values(values)
          .onConflictDoUpdate({ target: tables.currencies.isoCode, set: values })
      }
    }

    // Return true if currencies are synced
    return true
  }
  // Return false if currencies not synced
  return false
})