<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Groupes" :badge="categories.length">
        <template #right>
          <UButton label="Nouveau groupe" trailing-icon="i-heroicons-plus" color="gray"
            @click="createModalOpen = true" />
          <RefreshButton :loading="pending" @click="refresh" />
        </template>
      </UDashboardNavbar>

      <UDashboardModal v-model="createModalOpen" title="Nouveau groupe"
        description="Créer un nouveau groupe dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <GroupCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <!-- <UDashboardModal v-model="isEditCategoryModalOpen" title="Edit category"
        description="Be careful with this action, if could affect the system." :ui="{ width: 'sm:max-w-md' }">
        <CategoriesEditForm v-if="editCategory" :category="editCategory" @close="onFormClose()" />
      </UDashboardModal> -->

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
import { type Groups } from '~/server/utils/drizzle'
import GroupCreateForm from '../../components/GroupCreateForm.vue';
const router = useRouter();
const route = useRoute();
definePageMeta({
  layout: 'admin',
})
useSeoMeta({
  title: 'Dashboard',
})
// Table columns
const defaultColumns = [{
  key: 'id',
  label: 'ID'
}, {
  key: 'name',
  label: 'Nom'
}, {
  key: 'private',
  label: 'Privé'
}, {
  key: 'currencyIsoCode',
  label: 'Devise'
}, {
  key: 'createdAt',
  label: 'Date de création'
}, {
  key: 'updatedAt',
  label: 'Date de modification'
  }, {
    key: 'actions',
    label:'Actions'
}
]
const selectedColumns = ref(defaultColumns)
const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))
// Tables actions row
const items = (row) => {
  let items = [
    [{
      label: 'Editer',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
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
        icon: 'i-heroicons-trash-20-solid'
      }])
  }
  return items
}
// Table data
const { data: categories, refresh, pending } = await useFetch<Groups[]>(`/api/users/${route.params.id}/groups`, {
  deep: false,
  lazy: true,
  default: () => [],
})
function onFormClose() {
  createModalOpen.value = false
  // isEditCategoryModalOpen.value = false
  refresh()
}
const createModalOpen = ref(false)
const updateModalOpen = ref(false)
const currentGroup = ref<Group | null>(null)

</script>