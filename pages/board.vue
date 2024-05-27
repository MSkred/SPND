<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Tableaux" :badge="boards.length">
        <template #right>
          <UInput ref="input" v-model="q" icon="i-heroicons-funnel" autocomplete="off" placeholder="Filtrer les tableaux" class="hidden lg:block" @keydown.esc="$event.target.blur()">
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton label="Nouveau tableau" trailing-icon="i-heroicons-plus" color="gray" @click="createModalOpen = true"/>
        </template>
      </UDashboardNavbar>

      <UDashboardModal v-model="createModalOpen" title="Nouveau tableau" description="Créer une nouveau tableau dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <BoardCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-model="updateModalOpen" title="Modification du tableau" :ui="{ width: 'sm:max-w-md' }">
        <BoardEditForm v-if="currentBoard" :board="currentBoard" @close="onFormClose()"/>
      </UDashboardModal>

      <UDashboardModal v-if="currentBoard" v-model="deleteModalOpen" :title="`Suppression du tableau : ${currentBoard.name}`" :description="`Êtes-vous sûr de vouloir suprimer le tableau : ${currentBoard.name} ?`" icon="i-heroicons-exclamation-circle" :ui="{ icon: { base: 'text-red-500 dark:text-red-400' } as any, footer: { base: 'ml-16' } as any}">
        <template #footer>
          <UButton color="red" label="Supprimer" :loading="loading" @click="onDelete"/>
          <UButton color="white" label="Annuler" @click="deleteModalOpen = false"/>
        </template>
      </UDashboardModal>

      <UDashboardToolbar>
        <template #right>
          <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid" :options="defaultColumns" multiple>
            <template #label> Affichage </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>
      <UTable :columns="columns" :rows="boards" :loading="pending">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="text-sm">Aucun tableau pour ce groupe</span>
            <UButton label="Créer un tableau" trailing-icon="i-heroicons-plus" @click="createModalOpen = true"/>
          </div>
        </template>
        <template #name-data="{ row }">
          <span class="rounded text-white px-1.5 py-0.5" :style="{ 'background-color': row.color }">{{ row.icon ? row.icon + ' ' : '' }}{{ row.name }}</span>
        </template>
        <template #currencyId-data="{ row }">
          <span>{{ findAndBeautify(currencies, row.currencyId) }}</span>
        </template>
        <template #income-data="{ row }">
          <span>{{ row.income }}€</span>
        </template>
        <template #objective-data="{ row }">
          <span>{{ row.objective }}€</span>
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
      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { format, setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
setDefaultOptions({ locale: fr });
import { type Board, type Currency } from "~/server/utils/drizzle";

const route = useRoute();
const q = ref("");
useSeoMeta({ title: "Tableaux", });
// Table columns
const defaultColumns = [
  { key: "name", label: "Nom" },
  { key: "currencyId", label: "Devise" },
  { key: "income", label: "Entrée" },
  { key: "objective", label: "Objectif" },
  { key: "startDate", label: "Date de début" },
  { key: "endDate", label: "Date de fin" },
  { key: "actions", label: "Actions" },
];

const selectedColumns = ref(defaultColumns);
const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);
// Tables actions row
const items = (row: Board) => {
  let items = [
    [{
      label: "Editer",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => {
        currentBoard.value = row;
        updateModalOpen.value = true;
      },
    },],
    [{
      label: "Accéder",
      icon: "i-heroicons-arrow-right-circle-20-solid",
    },],
  ];
  if (!row.private) {
    items.push([
      {
        label: "Supprimer",
        icon: "i-heroicons-trash-20-solid",
        click: () => {
          currentBoard.value = row;
          deleteModalOpen.value = true;
        },
      },
    ]);
  }
  return items;
};
// Table data

const { data: currencies } = await useFetch<Currency[]>(`/api/currencies`, {
  deep: false,
  lazy: true,
  default: () => [],
});
function findAndBeautify(cible: Currency[], id: Number) {
  let find = cible.find(el => el.id === id)
  if (find) {
    return `${find.isoCode}`
  } else {
    return '-'
  }
}
const groupId = ref(route.query.group)
const { data: boards, refresh, pending } = await useFetch<Board[]>(`/api/boards`, { query: { group: groupId }, deep: false, lazy: true, default: () => [] });
function onFormClose() {
  createModalOpen.value = false;
  updateModalOpen.value = false;
  deleteModalOpen.value = false;
  currentBoard.value = null;
  loading.value = false;
  refresh();
}
const createModalOpen = ref(false);
const updateModalOpen = ref(false);
const currentBoard = ref<Board | null>(null);
const deleteModalOpen = ref(false);
const loading = ref(false);
const toast = useToast();

async function onDelete() {
  loading.value = true;
  try {
    await $fetch(`/api/boards/${currentBoard.value.id}`, { method: "DELETE" });
    toast.add({ icon: "i-heroicons-check-circle", title: `Le tableau "${currentBoard.value.name}" a bien été supprimé.`, color: "green" });
    onFormClose();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      toast.add({ icon: "i-heroicons-exclamation-circle", title: "Veuillez réessayer", description: e.message, color: "red" });
      loading.value = false;
    }
  }
}
watch(() => route.query.group, () => {
  groupId.value = route.query.group
  refresh()
});
</script>
