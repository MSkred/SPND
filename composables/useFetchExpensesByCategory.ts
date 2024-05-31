import type { ExpensesBy, Query } from "~/types"

export const useFetchExpensesByCategory = async (query: ComputedRef<Query>) => {

  // Fetch data 
  const { data, refresh, pending } = await useFetch<ExpensesBy>(`/api/expenses/byCategories`, {
    query,
    deep: false,
    lazy: true
  })

  // Return data
  return {
    data,
    refreshExpensesByCategory: refresh,
    pending
  }
}