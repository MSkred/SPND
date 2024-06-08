<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardModal v-model="createModalOpen" title="Nouveau tag" description="Créer une nouveau tag dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <TagCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-model="updateModalOpen" title="Modification du tag" :ui="{ width: 'sm:max-w-md' }">
        <TagEditForm v-if="currentTag" :tag="currentTag" @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-if="currentTag" v-model="deleteModalOpen" :title="`Suppression du tag : ${currentTag.name}`" :description="`Êtes-vous sûr de vouloir suprimer le tag : ${currentTag.name} ?`" icon="i-heroicons-exclamation-circle" :ui="{ icon: { base: 'text-red-500 dark:text-red-400' } as any, footer: { base: 'ml-16' } as any }">
        <template #footer>
          <UButton color="red" label="Supprimer" @click="onDelete" />
          <UButton color="white" label="Annuler" @click="deleteModalOpen = false" />
        </template>
      </UDashboardModal>

      <!-- Title and button -->
      <UDashboardNavbar v-if="data && data.rows" title="Tags" :badge="data.rows.length">
        <template #right>
          <UInput ref="input" v-model="q" icon="i-heroicons-funnel" autocomplete="off" placeholder="Filtrer les tags" class="hidden lg:block" @keydown.esc="$event.target.blur()">
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton label="Nouveau tag" trailing-icon="i-heroicons-plus" color="gray" @click="createModalOpen = true" />
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
            <div class="flex flex-row flex-nowrap gap-4 my-4 mt-0" v-if="data && data.charts">

              <!-- Donut chart -->
              <UDashboardCard class="w-[50%]">
                <ChartDonut label="Tag" :data="data.charts"/>
              </UDashboardCard>

              <!-- Bar chart -->
              <UDashboardCard class="w-[50%]" title="Top tags" description="Le top 8 des tags où vous dépenssez le plus." icon="i-heroicons-rectangle-stack-20-solid">
                <PercentList :data="data.charts" />
              </UDashboardCard>

            </div>
          </template>
        </UDashboardCard>
        
        <UDashboardCard :ui="{ wrapper: 'overflow-y-visible'}">
          <template #header>
            <div class="flex flex-row flex-nowrap justify-between items-center w-full cursor-pointer" @click="openList = !openList"  :class="{ 'pb-4': !openList }">
              <h1>Listes</h1>
              <UIcon name="i-heroicons-chevron-up-20-solid duration-200 h-5 w-5" :class="{ '-rotate-180': openList }"/>
            </div>
          </template>
          <template #default v-if="openList">
            <UTable v-if="data && data.rows" :columns="columns" :rows="data.rows" :loading="pending">
              <template #name-data="{ row }">
                <span class="rounded text-white px-1.5 py-0.5">{{ row.icon ? row.icon + ' ' : '' }}{{ row.name }}</span>
              </template>
              <template #expensesPrice-data="{ row }">
                <span>{{ row.expensesPrice ? row.expensesPrice.toFixed(2) : 0 }}{{ row.symbol }}</span>
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

<script setup lang="ts">
import { type Tag } from '~/server/utils/drizzle'
import type { Column, Query, Sort } from '~/types';
useSeoMeta({ title: 'Tags' })
// List toggle
const openList = ref<Boolean>(true)
const openStats = ref<Boolean>(true)
// Modal
const createModalOpen = ref<Boolean>(false)
const updateModalOpen = ref<Boolean>(false)
const currentTag = ref<Tag | null>(null)
const deleteModalOpen = ref<Boolean>(false)
const { loading, onDelete } = await useDeleteTags(currentTag, onFormClose)
function onFormClose() {
  createModalOpen.value = false
  updateModalOpen.value = false
  deleteModalOpen.value = false
  currentTag.value = null;
  loading.value = false;
  refreshExpensesByTags()
}
// Table 
const defaultColumns = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'expensesPrice', label: 'Prix', sortable: true },
  { key: 'actions', label: 'Actions' }
]
const selectedColumns = ref<Array<Column>>(defaultColumns)
const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))
const items = (row: Tag) => {
  return [
    [{
      label: 'Editer',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        currentTag.value = row
        updateModalOpen.value = true;
      }
    }],
    [{
      label: 'Accéder',
      icon: 'i-heroicons-arrow-right-circle-20-solid'
    }],
    [{
        label: 'Supprimer',
        icon: 'i-heroicons-trash-20-solid',
        click: () => {
          currentTag.value = row;
          deleteModalOpen.value = true;
        }
      }]
  ]
  
}
// Filter
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
const sort = ref<Sort>({ column: 'expensesPrice', direction: 'desc' as const })

// Params, query, fetch and refresh onWatch
const groupId = useGroupId()
const q = ref('')
const query: ComputedRef<Query> = computed(() => ({
  q: q.value,
  groupId: groupId.value,
  tagIds: selectedTags.value,
  boardIds: selectedBoards.value,
  categoryIds: selectedCategories.value,
  sort: sort.value.column,
  order: sort.value.direction
}))
const { data, refreshExpensesByTags, pending } = await useFetchExpensesByTags(query)
const { tags, refreshTags } = await useFetchTags(query)
const { boards, refreshBoards } = await useFetchBoards(query)
const { categories, refreshCategories } = await useFetchCategories(query)
watch(() => groupId, () => {
  refreshExpensesByTags()
  refreshTags()
  refreshBoards()
  refreshCategories()
});
</script>