<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Tags" :badge="tags.length">
        <template #right>
          <UInput ref="input" v-model="q" icon="i-heroicons-funnel" autocomplete="off" placeholder="Filtrer les tags" class="hidden lg:block" @keydown.esc="$event.target.blur()">
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton label="Nouveau tag" trailing-icon="i-heroicons-plus" color="gray" @click="createModalOpen = true" />
        </template>
      </UDashboardNavbar>

      <UDashboardModal v-model="createModalOpen" title="Nouveau tag" description="Créer une nouveau tag dans votre système" :ui="{ width: 'sm:max-w-md' }">
        <TagCreateForm @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-model="updateModalOpen" title="Modification du tag" :ui="{ width: 'sm:max-w-md' }">
        <TagEditForm v-if="currentTag" :tag="currentTag" @close="onFormClose()" />
      </UDashboardModal>

      <UDashboardModal v-if="currentTag" v-model="deleteModalOpen" :title="`Suppression du tag : ${currentTag.name}`" :description="`Êtes-vous sûr de vouloir suprimer le tag : ${currentTag.name} ?`" icon="i-heroicons-exclamation-circle" :ui="{ icon: { base: 'text-red-500 dark:text-red-400' } as any, footer: { base: 'ml-16' } as any }">
        <template #footer>
          <UButton color="red" label="Supprimer" :loading="loading" @click="onDelete" />
          <UButton color="white" label="Annuler" @click="deleteModalOpen = false" />
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
          <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid" :options="defaultColumns" multiple>
            <template #label> Affichage </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>
      <UTable :columns="columns" :rows="tags" :loading="pending">
        <template #name-data="{ row }">
          <span class="rounded text-white px-1.5 py-0.5" :style="{ 'background-color': row.color }">{{ row.icon ? row.icon + ' ' : '' }}{{ row.name }}</span>
        </template>
        <template #createdAt-data="{ row }">
          <span>{{ format(row.createdAt, 'dd/MM/yy, hh:mm')}}</span>
        </template>
        <template #updatedAt-data="{ row }">
          <span>{{ format(row.updatedAt, 'dd/MM/yy, hh:mm')}}</span>
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
import { type Tag } from "~/server/utils/drizzle";
const route = useRoute();
const q = ref('')
useSeoMeta({
  title: 'Dashboard',
})
// Table columns
const defaultColumns = [
  { key: 'name', label: 'Nom' },
  { key: 'createdAt', label: 'Date de création' },
  { key: 'updatedAt', label: 'Date de modification' },
  { key: 'actions', label: 'Actions' }
]

const selectedColumns = ref(defaultColumns)
const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))
// Tables actions row
const items = (row: Tag) => {
  let items = [
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
    }]
  ]
  if (!row.private) {
    items.push(
      [{
        label: 'Supprimer',
        icon: 'i-heroicons-trash-20-solid',
        click: () => {
          currentTag.value = row;
          deleteModalOpen.value = true;
        }
      }])
  }
  return items
}
// Table data
const groupId = ref(route.query.group)
const { data: tags, refresh, pending } = await useFetch<Tag[]>(`/api/tags`, { query: { groupId : groupId }, deep: false, lazy: true, default: () => [] })
function onFormClose() {
  createModalOpen.value = false
  updateModalOpen.value = false
  deleteModalOpen.value = false
  currentTag.value = null;
  loading.value = false;
  refresh()
}
const createModalOpen = ref(false)
const updateModalOpen = ref(false)
const currentTag = ref<Tag | null>(null)
const deleteModalOpen = ref(false)
const loading = ref(false)
const toast = useToast()

async function onDelete() {
  loading.value = true
  try {
    await $fetch(`/api/tags/${currentTag.value.id}`, { method: 'DELETE' })
    toast.add({ icon: 'i-heroicons-check-circle', title: `Le tag "${currentTag.value.name}" a bien été supprimé.`, color: 'green' })
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
  refresh()
});
</script>