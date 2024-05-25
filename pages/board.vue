<script lang="ts" setup>
import { type Category } from '~/server/utils/drizzle';

const defaultColumns = [{
  key: 'id',
  label: '#'
}, {
  key: 'name',
  label: 'Nom',
  sortable: true
  }, {
    key: 'actions',
    label: 'Actions'
  }]
const items = (row: Category) => {
  let items = [
    [{
      label: 'Editer',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        currentGroup.value = row
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
          currentGroup.value = row;
          deleteModalOpen.value = true;
        }
      }])
  }
  return items
}
const q = ref('')
const selected = ref<User[]>([])
const selectedColumns = ref(defaultColumns)
const selectedStatuses = ref([])
const selectedLocations = ref([])
const sort = ref({ column: 'id', direction: 'asc' as const })
const input = ref<{ input: HTMLInputElement }>()
const isNewUserModalOpen = ref(false)

const columns = computed(() => defaultColumns.filter(column => selectedColumns.value.includes(column)))

const query = computed(() => ({ q: q.value, statuses: selectedStatuses.value, locations: selectedLocations.value, sort: sort.value.column, order: sort.value.direction }))

const { data: users, pending } = await useFetch<User[]>('/api/users', { query, default: () => [] })

const defaultLocations = users.value.reduce((acc, user) => {
  if (!acc.includes(user.location)) {
    acc.push(user.location)
  }
  return acc
}, [] as string[])

const defaultStatuses = users.value.reduce((acc, user) => {
  if (!acc.includes(user.status)) {
    acc.push(user.status)
  }
  return acc
}, [] as string[])

function onSelect(row: User) {
  const index = selected.value.findIndex(item => item.id === row.id)
  if (index === -1) {
    selected.value.push(row)
  } else {
    selected.value.splice(index, 1)
  }
}

defineShortcuts({
  '/': () => {
    input.value?.input?.focus()
  }
})
</script>

<template>
  <UDashboardPage>
    <UDashboardPanel grow>
      <UDashboardNavbar title="Tableaux" :badge="users.length">
        <template #right>
          <UInput ref="input" v-model="q" icon="i-heroicons-funnel" autocomplete="off"
            placeholder="Filtrer les catégories…" class="hidden lg:block" @keydown.esc="$event.target.blur()">
            <template #trailing>
              <UKbd value="/" />
            </template>
          </UInput>

          <UButton label="Nouvelle catégorie" trailing-icon="i-heroicons-plus" color="gray"
            @click="isNewUserModalOpen = true" />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <USelectMenu v-model="selectedStatuses" icon="i-heroicons-cog-8-tooth" placeholder="Groupe" multiple
            :options="defaultStatuses" :ui-menu="{ option: { base: 'capitalize' } }" />
          <USelectMenu v-model="selectedLocations" icon="i-heroicons-table-cells-20-solid" placeholder="Tableau"
            :options="defaultLocations" multiple />
        </template>

        <template #right>
          <USelectMenu v-model="selectedColumns" icon="i-heroicons-adjustments-horizontal-solid"
            :options="defaultColumns" multiple class="hidden lg:block">
            <template #label>
              Affichage
            </template>
          </USelectMenu>
        </template>
      </UDashboardToolbar>

      <UDashboardModal v-model="isNewUserModalOpen" title="Nouvelle catégorie"
        description="Ajouter une nouvelle catégorie au système" :ui="{ width: 'sm:max-w-md' }">
        <!-- ~/components/users/UsersForm.vue -->
        <!-- <UsersForm @close="isNewUserModalOpen = false" /> -->
      </UDashboardModal>

      <UTable v-model="selected" v-model:sort="sort" :rows="users" :columns="columns" :loading="pending"
        sort-mode="manual" class="w-full" :ui="{ divide: 'divide-gray-200 dark:divide-gray-800' }" @select="onSelect">
        <template #name-data="{ row }">
          <div class="flex items-center gap-3">
            <UAvatar v-bind="row.avatar" :alt="row.name" size="xs" />

            <span class="text-gray-900 dark:text-white font-medium">{{ row.name }}</span>
          </div>
        </template>

        <template #status-data="{ row }">
          <UBadge :label="row.status"
            :color="row.status === 'subscribed' ? 'green' : row.status === 'bounced' ? 'orange' : 'red'"
            variant="subtle" class="capitalize" />
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