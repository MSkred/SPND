<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Tableaux" :badge="boards.length">
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filtrer les tableaux"
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="Nouveau tableau"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="createModalOpen = true"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardModal
        v-model="createModalOpen"
        title="Nouveau tableau"
        description="Créer une nouveau tableau dans votre système"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <BoardCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal
        v-model="updateModalOpen"
        title="Modification du tableau"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <BoardEditForm
          v-if="currentBoard"
          :board="currentBoard"
          @close="onFormClose()"
        />
      </UDashboardModal>

      <UDashboardModal
        v-if="currentBoard"
        v-model="deleteModalOpen"
        :title="`Suppression du tableau : ${currentBoard.name}`"
        :description="`Êtes-vous sûr de vouloir suprimer le tableau : ${currentBoard.name} ?`"
        icon="i-heroicons-exclamation-circle"
        :ui="{
        icon: { base: 'text-red-500 dark:text-red-400' } as any,
        footer: { base: 'ml-16' } as any
      }"
      >
        <template #footer>
          <UButton
            color="red"
            label="Supprimer"
            :loading="loading"
            @click="onDelete"
          />
          <UButton
            color="white"
            label="Annuler"
            @click="deleteModalOpen = false"
          />
        </template>
      </UDashboardModal>

      <UDashboardToolbar>
        <!-- <template #left>
          <USelectMenu v-model="selectedStatuses" icon="i-heroicons-cog-8-tooth" placeholder="Groupe" multiple
            :options="defaultStatuses" :ui-menu="{ option: { base: 'capitalize' } }" />
          <USelectMenu v-model="selectedLocations" icon="i-heroicons-table-cells-20-solid" placeholder="Tableau"
            :options="defaultLocations" multiple />
        </template> -->
        <template #right>
          <USelectMenu
            v-model="selectedColumns"
            icon="i-heroicons-adjustments-horizontal-solid"
            :options="defaultColumns"
            multiple
          >
            <template #label> Affichage </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>
      <UTable :columns="columns" :rows="boards" :loading="pending">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="text-sm">Aucun tableau pour ce groupe</span>
            <UButton
              label="Créer un tableau"
              trailing-icon="i-heroicons-plus"
              @click="createModalOpen = true"
            />
          </div>
        </template>
        <template #icon-data="{ row }">
          <span>{{ row.icon ? row.icon : "-" }}</span>
        </template>
        <template #color-data="{ row }">
          <div
            v-if="row.color"
            class="h-3 w-3 rounded"
            :style="{ 'background-color': row.color }"
          ></div>
          <template v-else> - </template>
        </template>
        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-ellipsis-horizontal-20-solid"
            />
          </UDropdown>
        </template>
      </UTable>
    </UDashboardPanel>
  </UDashboardPage>
</template>

<script setup lang="ts">
import { type Board } from "~/server/utils/drizzle";

const route = useRoute();
const q = ref("");
useSeoMeta({
  title: "Tableaux",
});
// Table columns
const defaultColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nom" },
  { key: "icon", label: "Icône" },
  { key: "color", label: "Couleur" },
  { key: "currencyIsoCode", label: "Devise" },
  { key: "income", label: "Entrée" },
  { key: "objective", label: "Objectif" },
  { key: "startDate", label: "Date de début" },
  { key: "endDate", label: "Date de fin" },
  { key: "createdAt", label: "Date de création" },
  { key: "updatedAt", label: "Date de modification" },
  { key: "actions", label: "Actions" },
];

const selectedColumns = ref(defaultColumns);
const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);
// Tables actions row
const items = (row: Board) => {
  let items = [
    [
      {
        label: "Editer",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => {
          currentBoard.value = row;
          updateModalOpen.value = true;
        },
      },
    ],
    [
      {
        label: "Accéder",
        icon: "i-heroicons-arrow-right-circle-20-solid",
      },
    ],
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
const groupId = ref(route.query.group)
const {
  data: boards,
  refresh,
  pending,
} = await useFetch<Board[]>(`/api/boards`, {
  query: { group: groupId },
  deep: false,
  lazy: true,
  default: () => [],
});
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
    await $fetch(`/api/boards/${currentBoard.value.id}`, {
      method: "DELETE",
    });
    toast.add({
      icon: "i-heroicons-check-circle",
      title: `Le tableau "${currentBoard.value.name}" a bien été supprimé.`,
      color: "green",
    });
    onFormClose();
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        title: "Veuillez réessayer",
        description: e.message,
        color: "red",
      });
      loading.value = false;
    }
  }
}
watch(() => route.query.group, () => {
  groupId.value = route.query.group
  refresh()
});
</script>
