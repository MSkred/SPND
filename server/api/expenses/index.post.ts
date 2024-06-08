import { object, string, number, boolean, date } from 'zod'
import { CurrencySyncApi } from '~/types';

export default defineEventHandler(async (event) => {
  
  // Verify body key types
  const body = await readValidatedBody(event, object({
    name: string().min(2, { message: "Must be 2 or more characters long" }),
    price: number().positive(),
    start_date: string(),
    end_date: string().nullish(),
    currency_id: number(),
    category_id: number({ coerce: true }),
    board_id: number({ coerce: true }),
    tag_id: number({ coerce: true }).nullish(),
    group_id: number({ coerce: true }),
  }).parse)


  // Verify if this user ve access to the expense's group
  await requireUserGroupAccess(event, [body.group_id])

  let groupCurrency, expenseCurrency, group, ts;
  // Get linked group by id
  group = await useDrizzle().select().from(tables.groups).where(eq(tables.groups.id, body.group_id)).get()
  if (group) {
    // GET linked currency to this group
    groupCurrency = await useDrizzle().select().from(tables.currencies).where(eq(tables.currencies.id, group.currencyId)).get()
  } else {
    throw createError({
      status: 400,
      message: "Linked group currency not found",
    });
  }
  // GET linked currency to this expense
  expenseCurrency = await useDrizzle().select().from(tables.currencies).where(eq(tables.currencies.id, body.currency_id)).get()

  // SET updated timestamp
  ts = new Date(expenseCurrency!.updatedAt).getTime()

  // Fetch currencies-api and pass timestamp query params for compare with API 
  const currenciesSync = await $fetch<CurrencySyncApi>('/api/currencies/sync', { method: 'POST', query: { ts } })
  
  // If currencies sync refetch expense currency with new rate
  if (!currenciesSync) expenseCurrency = await useDrizzle().select().from(tables.currencies).where(eq(tables.currencies.id, body.currency_id)).get()

  if (expenseCurrency) {
    // Create category with data from body
    await useDrizzle().insert(tables.expenses).values({
      name: body.name,
      price: body.price,
      startDate: body.start_date,
      endDate: body.end_date,
      currencyId: body.currency_id,
      categoryId: body.category_id,
      tagId: body.tag_id,
      boardId: body.board_id,
      groupId: body.group_id,
      expenseRate: expenseCurrency.rate,
      convertedPrice: ((body.price / expenseCurrency.rate) * groupCurrency!.rate)
    }).execute()
  
    return sendNoContent(event, 201)
  } else {
    throw createError({
      status: 400,
      message: "Linked expense currency not found",
    });
  }
})