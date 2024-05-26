<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Dépenses" :badge="expenses.length">
        <template #right>
          <UInput
            ref="input"
            v-model="q"
            icon="i-heroicons-funnel"
            autocomplete="off"
            placeholder="Filtrer les dépenses"
            class="hidden lg:block"
            @keydown.esc="$event.target.blur()"
          >
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton
            label="Nouvelle dépense"
            trailing-icon="i-heroicons-plus"
            color="gray"
            @click="createModalOpen = true"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardModal
        v-model="createModalOpen"
        title="Nouvelle dépense"
        description="Créer une nouvelle dépense dans votre système"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <ExpenseCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal
        v-model="updateModalOpen"
        title="Modification de la dépense"
        :ui="{ width: 'sm:max-w-md' }"
      >
        <ExpenseEditForm
          v-if="currentExpense"
          :expense="currentExpense"
          @close="onFormClose()"
        />
      </UDashboardModal>

      <UDashboardModal
        v-if="currentExpense"
        v-model="deleteModalOpen"
        :title="`Suppression de la dépense : ${currentExpense.name}`"
        :description="`Êtes-vous sûr de vouloir suprimer la dépense : ${currentExpense.name} ?`"
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
      <UTable :columns="columns" :rows="expenses" :loading="pending">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 gap-3">
            <span class="text-sm">Aucun dépense pour ce groupe</span>
            <UButton
              label="Créer une dépense"
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
import { type Expense } from "~/server/utils/drizzle";

const route = useRoute();
const q = ref("");
useSeoMeta({
  title: "Dépenses",
});
// Table columns
const defaultColumns = [
  { key: "id", label: "ID" },
  { key: "name", label: "Nom" },
  { key: "price", label: "Prix" },
  { key: "color", label: "Couleur" },
  { key: "startDate", label: "Date" },
  { key: "endDate", label: "Date de fin" },
  { key: "currencyIsoCode", label: "Devise" },

  { key: "category_id", label: "Catégorie" },
  { key: "board_id", label: "Tableau" },
  { key: "tag_id", label: "Tag" },
  { key: "group_id", label: "Groupe" },
  { key: "createdAt", label: "Date de création" },
  { key: "updatedAt", label: "Date de modification" },
  { key: "actions", label: "Actions" },
];

const selectedColumns = ref(defaultColumns);
const columns = computed(() =>
  defaultColumns.filter((column) => selectedColumns.value.includes(column))
);
// Tables actions row
const items = (row: Expense) => {
  let items = [
    [
      {
        label: "Editer",
        icon: "i-heroicons-pencil-square-20-solid",
        click: () => {
          currentExpense.value = row;
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
          currentExpense.value = row;
          deleteModalOpen.value = true;
        },
      },
    ]);
  }
  return items;
};
// FETCH EXPENSES
const { data: expenses, refresh, pending } = await useFetch<Expense[]>(`/api/expenses?group=${route.query.group}`, {
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
  refresh();
}
const createModalOpen = ref(false);
const updateModalOpen = ref(false);
const currentExpense = ref<Expense | null>(null);
const deleteModalOpen = ref(false);
const loading = ref(false);
const toast = useToast();

async function onDelete() {
  loading.value = true;
  try {
    await $fetch(`/api/expenses/${currentExpense.value.id}`, {
      method: "DELETE",
    });
    toast.add({
      icon: "i-heroicons-check-circle",
      title: `Le tableau "${currentExpense.value.name}" a bien été supprimé.`,
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
</script>
