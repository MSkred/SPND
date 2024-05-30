import type { Tag } from "~/server/utils/drizzle";
import type { Query } from "~/types";

export const useFetchTags = async (query: ComputedRef<Query>) => {
  // Fetch data 
  const { data: tags, refresh, pending} = await useFetch<Tag[]>(`/api/tags`, {
    query,
    deep: false,
    lazy: true,
    default: () => [],
  })

  // Return data
  return {
    tags,
    refreshTags: refresh,
    pending
  }
}