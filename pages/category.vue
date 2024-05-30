<script setup lang="ts">
// NEW
useSeoMeta({ title: 'Dashboard' })
const groupId = useGroupId()

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

const resetFilters = () => {
  selectedTags.value = []
  selectedBoards.value = []
  selectedCategories.value = []
}

const sort = ref({ column: 'expensesPrice', direction: 'desc' as const })
const query : ComputedRef<Query> = computed(() => ({
  groupId: groupId.value,
  tagIds: selectedTags.value,
  boardIds: selectedBoards.value,
  categoryIds: selectedCategories.value,
  sort: sort.value.column,
  order: sort.value.direction
}))

// NEW
// data fetching
const { data, refreshExpensesByCategory, pending } = await useFetchExpensesByCategory(query)
const { tags, refreshTags } = await useFetchTags(query)
const { boards, refreshBoards } = await useFetchBoards(query)
const { categories, refreshCategories } = await useFetchCategories(query)
// get filter datas
// const { filterTags, selectedTags, filterBoards, selectedBoards, filterCategories, selectedCategories, resetFilters } = await useFilters(boards, categories, tags);
// watch query params and update data on change
watch(() => groupId, () => {
  refreshExpensesByCategory()
  refreshTags()
  refreshBoards()
  refreshCategories()
});
// list toggles
const openList = ref(true)
const openStats = ref(true)

// OLD 
import { type Category } from '~/server/utils/drizzle'
import type { Query } from '~/types';



// Table columns
const defaultColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'expensesPrice', label: 'Prix', sortable: true },
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
  return items
}



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


// FETCH CATEGORIES BY GROUP

const toast = useToast()
const loading = ref(false)
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
// useDeleteCategory()

</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
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

      <!-- Title and button -->
      <UDashboardNavbar title="Catégories" :badge="data.rows.length">
        <template #right>
          <UButton label="Nouvelle catégorie" trailing-icon="i-heroicons-plus" color="gray" @click="createModalOpen = true" />
        </template>
      </UDashboardNavbar>

      <!-- Filter, display column and reset -->
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

      <!-- Stats and list -->
      <UDashboardPanelContent class="gap-4">

        <!-- Statistics -->
        <UDashboardCard>
          <template #header>
            <div class="flex flex-row flex-nowrap justify-between items-center w-full cursor-pointer" @click="openStats = !openStats" :class="{ 'pb-4': !openStats }">
              <h1>Statistiques</h1>
              <UIcon name="i-heroicons-chevron-up-20-solid duration-200 h-5 w-5" :class="{ '-rotate-180': openStats }"/>
            </div>
          </template>
          <template #default v-if="openStats">
            <div class="flex flex-row flex-nowrap gap-4 my-4 mt-0">

              <!-- Donut chart -->
              <UDashboardCard class="w-[50%]">
                <ChartDonut :data="data.charts"/>
              </UDashboardCard>

              <!-- Bar chart -->
              <UDashboardCard class="w-[50%]" title="Top catégories" description="Le top 8 des catégories où vous dépenssez le plus." icon="i-heroicons-rectangle-stack-20-solid">
                <CategoryPercentList :data="data.charts" />
              </UDashboardCard>

            </div>
          </template>
        </UDashboardCard>

        <!-- Table list -->
        <UDashboardCard :ui="{ wrapper: 'overflow-y-visible'}">
          <template #header>
            <div class="flex flex-row flex-nowrap justify-between items-center w-full cursor-pointer" @click="openList = !openList"  :class="{ 'pb-4': !openList }">
              <h1>Listes</h1>
              <UIcon name="i-heroicons-chevron-up-20-solid duration-200 h-5 w-5" :class="{ '-rotate-180': openList }"/>
            </div>
          </template>
          <template #default v-if="openList">
            <UTable :columns="columns" :rows="data.rows" :loading="pending" v-model:sort="sort" sort-mode="manual"  :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }" :progress="{ color: 'primary', animation: 'carousel' }">
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
          </template>
        </UDashboardCard>

      </UDashboardPanelContent>
    </UDashboardPanel>
  </UDashboardPage>
</template>
