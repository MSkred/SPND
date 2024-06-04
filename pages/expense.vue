<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Dépenses" :badge="expenses.length">
        <template #right>
          <UInput ref="input" v-model="q" icon="i-heroicons-funnel" autocomplete="off" placeholder="Filtrer les dépenses" class="hidden lg:block" @keydown.esc="$event.target.blur()">
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>
          <UButton label="Nouvelle dépense" trailing-icon="i-heroicons-plus" color="gray" @click="createModalOpen = true"/>
        </template>
      </UDashboardNavbar>

      <UDashboardModal v-model="createModalOpen" title="Nouvelle dépense" description="Créer une nouvelle dépense dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <ExpenseCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-model="updateModalOpen" title="Modification de la dépense" :ui="{ width: 'sm:max-w-md' }">
        <ExpenseEditForm v-if="currentExpense" :expense="currentExpense" @close="onFormClose()"/>
      </UDashboardModal>

      <UDashboardModal v-if="currentExpense" v-model="deleteModalOpen" :title="`Suppression de la dépense : ${currentExpense.name}`" :description="`Êtes-vous sûr de vouloir suprimer la dépense : ${currentExpense.name} ?`" icon="i-heroicons-exclamation-circle" :ui="{ icon: { base: 'text-red-500 dark:text-red-400' } as any, footer: { base: 'ml-16' } as any }">
        <template #footer>
          <UButton color="red" label="Supprimer" :loading="loading" @click="onDelete"/>
          <UButton color="white" label="Annuler" @click="deleteModalOpen = false"/>
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

          <UButton icon="i-heroicons-funnel" color="gray" size="xs" :disabled="q === '' && selectedBoards.length === 0 && selectedCategories.length === 0 && selectedTags.length === 0" @click="resetFilters">
            Réintialiser
          </UButton>
        </template>
      </UDashboardToolbar>

      <UTable :columns="columns" :rows="rows" :loading="pending" v-model:sort="sort" sort-mode="manual"  :loading-state="{ icon: 'i-heroicons-arrow-path-20-solid', label: 'Loading...' }" :progress="{ color: 'primary', animation: 'carousel' }">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="text-sm">Aucun dépense pour ce groupe</span>
            <UButton label="Créer une dépense" trailing-icon="i-heroicons-plus" @click="createModalOpen = true"/>
          </div>
        </template>
        <template #convertedPrice-data="{ row }">
          <span>{{ beautifyPrice(currencies, row) }}</span>
        </template>
        <template #boardId-data="{ row }">
          <span>{{ findAndBeautify(boards, row.boardId) }}</span>
        </template>
        <template #categoryId-data="{ row }">
          <span>{{ findAndBeautify(categories, row.categoryId) }}</span>
        </template>
        <template #tagId-data="{ row }">
          <span>{{ findAndBeautify(tags, row.tagId) }}</span>
        </template>
        <template #startDate-data="{ row }">
          <span>{{ format(row.startDate, 'd MMM, yyy')}}</span>
        </template>
        <template #endDate-data="{ row }">
          <span>{{ row.endDate ? format(row.endDate, 'd MMM, yyy') : '-'}}</span>
        </template>
        <template #createdAt-data="{ row }">
          <span>{{ format(row.createdAt, 'dd/MM/yy, hh:mm')}}</span>
        </template>
        <template #updatedAt-data="{ row }">
          <span>{{ format(row.updatedAt, 'dd/MM/yy, hh:mm')}}</span>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid"/>
          </UDropdown>
        </template>
        <!-- <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700"> -->
          

        <!-- </div> -->
        <!-- Number of rows & Pagination -->
      </UTable>
          <div class="flex justify-end px-3 py-3.5 border-t border-gray-200 dark:border-gray-700">
          <UPagination :active-button="{ variant: 'outline' }" :inactive-button="{ color: 'gray' }" v-model="page" :page-count="pageCount" :total="expenses.length" />
        </div>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { format, setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
setDefaultOptions({ locale: fr });
import { type Category, type Expense, type Tag } from "~/server/utils/drizzle";
const route = useRoute();
const q = ref("");
const createModalOpen = ref(false);
const updateModalOpen = ref(false);
const currentExpense = ref<Expense | null>(null);
const deleteModalOpen = ref(false);
const loading = ref(false);
const toast = useToast();
const defaultColumns = [
  { key: "name", label: "Nom", sortable: true },
  { key: "convertedPrice", label: "Prix", sortable: true },
  { key: "startDate", label: "Date", sortable: true },
  { key: "endDate", label: "Date de fin" },
  { key: "boardId", label: "Tableau" },
  { key: "categoryId", label: "Catégorie" },
  { key: "tagId", label: "Tag" },
  { key: "actions", label: "Actions" },
];
const selectedColumns = ref(defaultColumns);
const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);
const filterCategories = computed(() => {
  return categories.value.map(el => {
    return { name: `${el.icon ? el.icon + ' ' : ''}${el.name}`, id: el.id }
  })
})
const selectedCategories = ref([])
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
const sort = ref({ column: 'startDate', direction: 'desc' as const })

const resetFilters = () => {
  q.value = ''
  selectedCategories.value = []
  selectedTags.value = []
  selectedBoards.value = []
}
const query = computed(() => ({ q: q.value, groupId: groupId.value, categoryIds: selectedCategories.value, tagIds: selectedTags.value, boardIds: selectedBoards.value, sort: sort.value.column, order: sort.value.direction })) // locations: selectedLocations.value
const page = ref(1)
const pageCount = 10
const rows = computed(() => {
  return expenses.value.slice((page.value - 1) * pageCount, (page.value) * pageCount)
})

useSeoMeta({ title: "Dépenses" });
const groupId = ref(route.query.group)
// Tables actions row
const items = (row: Expense) => {
  let items = [
    [ { label: "Editer", icon: "i-heroicons-pencil-square-20-solid", click: () => {
          currentExpense.value = row;
          updateModalOpen.value = true;
        },
      },
    ],
    [ { label: "Accéder", icon: "i-heroicons-arrow-right-circle-20-solid" } ],
  ];
  return items;
};
// FETCH EXPENSES
const { data: expenses, refresh: refreshExpenses, pending } = await useFetch<Expense[]>(`/api/expenses`, {
  query,
  deep: false,
  lazy: true,
  default: () => []
});
// FETCH CATEGORIES BY GROUP
const { data: categories, refresh: refreshCategories } = await useFetch<Category[]>(`/api/categories`, {
  query: { groupId: groupId },
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH TAGS BY GROUP
const { data: tags, refresh: refreshTags } = await useFetch<Tag[]>(`/api/tags`, {
  query: { groupId: groupId },
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH BOARDS BY GROUP
const { data: boards, refresh: refreshBoards } = await useFetch<Board[]>(`/api/boards`, {
  query: { groupId: groupId },
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH CURRENT GROUP BY ID
const { data: group, refresh: refreshGroup } = await useFetch<Board[]>(`/api/groups/${groupId.value}`, {
  deep: false,
  lazy: true,
  default: () => [],
})
const { data: currencies, refresh: refreshCurrencies } = await useFetch<Currency[]>(`/api/currencies`, {
  deep: false,
  lazy: true,
  default: () => [],
});

function onFormClose() {
  createModalOpen.value = false;
  updateModalOpen.value = false;
  deleteModalOpen.value = false;
  currentExpense.value = null;
  loading.value = false;
  refreshExpenses();
}
async function onDelete() {
  loading.value = true;
  try {
    await $fetch(`/api/expenses/${currentExpense.value!.id}`, { method: "DELETE" });
    toast.add({ icon: "i-heroicons-check-circle", title: `Le tableau "${currentExpense.value!.name}" a bien été supprimé.`, color: "green" });
    onFormClose();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      toast.add({ icon: "i-heroicons-exclamation-circle", title: "Veuillez réessayer", description: e.message, color: "red" });
      loading.value = false;
    }
  }
}
function findAndBeautify(cible: Tag[] | Category[] | Board[], id: number) {
  let find = cible.find(el => el.id === id)
  if (find) {
    return `${ find.icon ? find.icon + ' ' : '' }${find.name}`
  } else {
    return '-'
  }
}

function beautifyPrice(cible: Currency[], row: Expense) {
  let find = cible.find(el => el.id === group.value.currencyId)
  if (find) {
    return `${row.convertedPrice} ${ find.symbol }`
  } else {
    return '-'
  }
}

watch(() => route.query.group, () => {
  groupId.value = route.query.group
  refreshExpenses()
  refreshCategories()
  refreshTags()
  refreshBoards()
  refreshGroup()
});
</script>
