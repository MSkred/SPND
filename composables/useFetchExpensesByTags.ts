import type { ExpensesBy, Query } from "~/types"

export const useFetchExpensesByTags = async (query: ComputedRef<Query>) => {

  // Fetch data 
  const { data, refresh, pending } = await useFetch<ExpensesBy>(`/api/expenses/byTags`, {
    query,
    deep: false,
    lazy: true
  })

  // Return data
  return {
    data,
    refreshExpensesByTags: refresh,
    pending
  }
}