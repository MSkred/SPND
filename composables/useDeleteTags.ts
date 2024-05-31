import type { Tag } from "~/server/utils/drizzle"

export const useDeleteTags = async (tag: Ref<Tag | null>, callback: Function) => {
  const toast = useToast()
  const loading = ref<Boolean>(false)
  async function onDelete() {
    loading.value = true
    try {
      await $fetch(`/api/tags/${tag.value ? tag.value.id : null}`, { method: 'DELETE' })
      toast.add({ icon: 'i-heroicons-check-circle', title: `Le tag "${tag.value ? tag.value.name : null}" a bien été supprimé.`, color: 'green' })
      callback()
    }
    catch (e) {
      if (e instanceof Error) {
        console.error(e)
        toast.add({ icon: 'i-heroicons-exclamation-circle', title: 'Veuillez réessayer', description: e.message, color: 'red' })
        loading.value = false;
      }
    }
  }
  return { loading, onDelete }
}