<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Catégorie" :badge="categories.length">
        <template #right>
          <UButton label="Nouvelle catégorie" trailing-icon="i-heroicons-plus" color="gray"
            @click="createModalOpen = true" />
        </template>
      </UDashboardNavbar>

      <UDashboardModal v-model="createModalOpen" title="Nouvelle catégorie"
        description="Créer une nouvelle catégorie dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <CategoryCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-model="updateModalOpen" title="Modification de la catégorie"
        :ui="{ width: 'sm:max-w-md' }">
        <CategoryEditForm v-if="currentCategory" :category="currentCategory" @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-if="currentCategory" v-model="deleteModalOpen"
        :title="`Suppression de la catégorie : ${currentCategory.name}`"
        :description="`Êtes-vous sûr de vouloir suprimer la catégorie : ${currentCategory.name} ?`"
        icon="i-heroicons-exclamation-circle" :ui="{
        icon: { base: 'text-red-500 dark:text-red-400' } as any,
        footer: { base: 'ml-16' } as any
      }">
        <template #footer>
          <UButton color="red" label="Supprimer" :loading="loading" @click="onDelete" />
          <UButton color="white" label="Annuler" @click="deleteModalOpen = false" />
        </template>
      </UDashboardModal>

      <UDashboardToolbar>
        <template #right>
          <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid"
            :options="defaultColumns" multiple>
            <template #label>
              Affichage
            </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>
      <UTable :columns="columns" :rows="categories" :loading="pending">
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </template>
      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { type Category } from '~/server/utils/drizzle'
const router = useRouter();
const route = useRoute();
const { user } = useUserSession();

useSeoMeta({
  title: 'Dashboard',
})
// Table columns
const defaultColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'icon', label: 'Icône' },
  { key: 'color', label: 'Couleur' },
  { key: 'createdAt', label: 'Date de création' },
  { key: 'updatedAt', label: 'Date de modification' },
  { key: 'actions', label: 'Actions' }
]

const selectedColumns = ref(defaultColumns)
const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))
// Tables actions row
const items = (row: Category) => {
  let items = [
    [{
      label: 'Editer',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        currentCategory.value = row
        updateModalOpen.value = true;
      }
    }],
    [{
      label: 'Accéder',
      icon: 'i-heroicons-arrow-right-circle-20-solid'
    }]
  ]
  if (!row.private) {
    items.push(
      [{
        label: 'Supprimer',
        icon: 'i-heroicons-trash-20-solid',
        click: () => {
          currentCategory.value = row;
          deleteModalOpen.value = true;
        }
      }])
  }
  return items
}
// Table data
const { data: categories, refresh, pending } = await useFetch<Category[]>(`/api/categories?group=${route.query.group}`, {
  deep: false,
  lazy: true,
  default: () => [],
})
function onFormClose() {
  createModalOpen.value = false
  updateModalOpen.value = false
  deleteModalOpen.value = false
  currentCategory.value = null;
  loading.value = false;
  refresh()
}
const createModalOpen = ref(false)
const updateModalOpen = ref(false)
const currentCategory = ref<Category | null>(null)
const deleteModalOpen = ref(false)
const loading = ref(false)
const toast = useToast()

async function onDelete() {
  loading.value = true
  try {
    await $fetch(`/api/categories/${currentCategory.value.id}`, {
      method: 'DELETE'
    })
    toast.add({
      icon: 'i-heroicons-check-circle',
      title: `La catégorie "${currentCategory.value.name}" a bien été supprimé.`,
      color: 'green',
    })
    onFormClose()
  }
  catch (e) {
    if (e instanceof Error) {
      console.error(e)
      toast.add({
        icon: 'i-heroicons-exclamation-circle',
        title: 'Veuillez réessayer',
        description: e.message,
        color: 'red',
      })
      loading.value = false;
    }
  }
}
</script>