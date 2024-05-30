import type { Query } from "~/types"

export const useFetchBoards = async (query: ComputedRef<Query>) => {

  // Fetch data 
  const { data, refresh } = await useFetch<Board[]>(`/api/boards`, {
    query,
    deep: false,
    lazy: true,
    default: () => [],
  })

  // Return data
  return {
    boards: data,
    refreshBoards: refresh,
  }
}