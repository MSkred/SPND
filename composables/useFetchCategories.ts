import type { Query } from "~/types"

export const useFetchCategories = async (query: ComputedRef<Query>) => {

  const groupId = useGroupId()

  // Fetch data 
  const { data, refresh } = await useFetch<Category[]>(`/api/categories`, {
    query: query,
    deep: false,
    lazy: true,
    default: () => [],
  })

  // Return data
  return {
    categories: data,
    refreshCategories: refresh
  }
}