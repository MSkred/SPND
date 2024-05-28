<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Catégories" :badge="rows.length">
        <template #right>
          <UButton label="Nouvelle catégorie" trailing-icon="i-heroicons-plus" color="gray" @click="createModalOpen = true" />
        </template>
      </UDashboardNavbar>

      <UDashboardModal v-model="createModalOpen" title="Nouvelle catégorie" description="Créer une nouvelle catégorie dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <CategoryCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-model="updateModalOpen" title="Modification de la catégorie" :ui="{ width: 'sm:max-w-md' }">
        <CategoryEditForm v-if="currentCategory" :category="currentCategory" @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-if="currentCategory" v-model="deleteModalOpen" :title="`Suppression de la catégorie : ${currentCategory.name}`" :description="`Êtes-vous sûr de vouloir suprimer la catégorie : ${currentCategory.name} ?`" icon="i-heroicons-exclamation-circle" :ui="{ icon: { base: 'text-red-500 dark:text-red-400' } as any, footer: { base: 'ml-16' } as any }">
        <template #footer>
          <UButton color="red" label="Supprimer" :loading="loading" @click="onDelete" />
          <UButton color="white" label="Annuler" @click="deleteModalOpen = false" />
        </template>
      </UDashboardModal>

      <UDashboardToolbar>
        <template #left>
          <USelectMenu v-model="selectedCategories" icon="i-heroicons-rectangle-stack-20-solid" placeholder="Catégorie" multiple :options="filterCategories" option-attribute="name" value-attribute="id" searchable searchablePlaceholder="Chercher…">
            <template #label>
              <span v-if="selectedCategories.length" class="truncate">{{ selectedCategories.length }} sélectionnée{{ selectedCategories.length > 1 ? 's' : '' }}</span>
              <span v-else>Catégorie</span>
            </template>
          </USelectMenu>
          <USelectMenu v-model="selectedTags" icon="i-heroicons-tag-20-solid" placeholder="Tag" multiple :options="filterTags" option-attribute="name" value-attribute="id" searchable searchablePlaceholder="Chercher…">
            <template #label>
              <span v-if="selectedTags.length" class="truncate">{{ selectedTags.length }} sélectionné{{ selectedTags.length > 1 ? 's' : '' }}</span>
              <span v-else>Tag</span>
            </template>
          </USelectMenu>
          <USelectMenu v-model="selectedBoards" icon="i-heroicons-table-cells-20-solid" placeholder="Tableau" multiple :options="filterBoards" option-attribute="name" value-attribute="id" searchable searchablePlaceholder="Chercher…">
            <template #label>
              <span v-if="selectedBoards.length" class="truncate">{{ selectedBoards.length }} sélectionné{{ selectedBoards.length > 1 ? 's' : '' }}</span>
              <span v-else>Tableau</span>
            </template>
          </USelectMenu>
        </template>
        <template #right>
          <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid" :options="defaultColumns" multiple>
            <template #label> Affichage </template>
          </USelectMenu>
          <UButton icon="i-heroicons-funnel" color="gray" size="xs" :disabled="selectedBoards.length === 0 && selectedTags.length === 0 && selectedCategories.length === 0" @click="resetFilters">
            Réintialiser
          </UButton>
        </template>
      </UDashboardToolbar>
        <UTable :columns="columns" :rows="rows" :loading="pending" v-model:sort="sort" sort-mode="manual"  :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }" :progress="{ color: 'primary', animation: 'carousel' }">
        <template #name-data="{ row }">
          <span class="rounded text-white px-1.5 py-0.5" :style="{ 'background-color': row.color }">{{ row.icon ? row.icon + ' ' : '' }}{{ row.name }}</span>
        </template>
        <template #expensesPrice-data="{ row }">
          <span>{{ row.expensesPrice.toFixed(2) }}{{ row.symbol }}</span>
        </template>
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
import { format, setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
setDefaultOptions({ locale: fr });
import { type Category } from '~/server/utils/drizzle'
const route = useRoute();
useSeoMeta({ title: 'Dashboard' })
const groupId = ref(route.query.group)
// Table columns
const defaultColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'expensesPrice', label: 'Prix', sortable: true },
  { key: 'actions', label: 'Actions' }
]

const filterTags = computed(() => {
  return tags.value.map(el => {
    return { name: `${el.icon ? el.icon + ' ' : ''}${el.name}`, id: el.id }
  })
})
const selectedTags = ref([])
const filterBoards = computed(() => {
  return boards.value.map(el => {
    return { name: `${el.icon ? el.icon + ' ' : ''}${el.name}`, id: el.id }
  })
})
const selectedBoards = ref([])
const filterCategories = computed(() => {
  return categories.value.map(el => {
    return { name: `${el.icon ? el.icon + ' ' : ''}${el.name}`, id: el.id }
  })
})
const selectedCategories = ref([])
const sort = ref({ column: 'expensesPrice', direction: 'desc' as const })

const resetFilters = () => {
  selectedTags.value = []
  selectedBoards.value = []
  selectedCategories.value = []
}
const query = computed(() => ({ groupId: groupId.value, tagIds: selectedTags.value, boardIds: selectedBoards.value, categoryIds: selectedCategories.value, sort: sort.value.column, order: sort.value.direction }))
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
  return items
}
// Table data
const { data: rows, refresh: refreshExpensesByCategory, pending } = await useFetch<Category[]>(`/api/expenses/byCategories`, {
  query,
  deep: false,
  lazy: true, 
  default: () => []
})
function onFormClose() {
  createModalOpen.value = false
  updateModalOpen.value = false
  deleteModalOpen.value = false
  currentCategory.value = null;
  loading.value = false;
  refreshExpensesByCategory()
}
const createModalOpen = ref(false)
const updateModalOpen = ref(false)
const currentCategory = ref<Category | null>(null)
const deleteModalOpen = ref(false)
const loading = ref(false)
const toast = useToast()

// FETCH TAGS BY GROUP
const { data: tags, refresh: refreshTags } = await useFetch<Tag[]>(`/api/tags`, {
  query: { group: groupId },
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH BOARDS BY GROUP
const { data: boards, refresh: refreshBoards } = await useFetch<Board[]>(`/api/boards`, {
  query: { group: groupId },
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH CATEGORIES BY GROUP
const { data: categories, refresh: refreshCategories } = await useFetch<Category[]>(`/api/categories`, {
  query: { group: groupId },
  deep: false,
  lazy: true,
  default: () => [],
})
async function onDelete() {
  loading.value = true
  try {
    await $fetch(`/api/categories/${currentCategory.value.id}`, { method: 'DELETE' })
    toast.add({ icon: 'i-heroicons-check-circle', title: `La catégorie "${currentCategory.value.name}" a bien été supprimé.`, color: 'green' })
    onFormClose()
  }
  catch (e) {
    if (e instanceof Error) {
      console.error(e)
      toast.add({ icon: 'i-heroicons-exclamation-circle', title: 'Veuillez réessayer', description: e.message, color: 'red' })
      loading.value = false;
    }
  }
}
watch(() => route.query.group, () => {
  groupId.value = route.query.group
  refreshExpensesByCategory()
  refreshTags()
  refreshBoards()
});
</script>