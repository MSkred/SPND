import type { Query } from "~/types"

export const useFetchExpensesByCategory = async (query: ComputedRef<Query>) => {

  // Fetch data 
  const { data, refresh, pending } = await useFetch<any[]>(`/api/expenses/byCategories`, {
    query,
    deep: false,
    lazy: true,
    default: () => []
  })

  // Return data
  return {
    data,
    refreshExpensesByCategory: refresh,
    pending
  }
}