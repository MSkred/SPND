<script setup lang="ts">
const { isHelpSlideoverOpen } = useDashboard()
const { isDashboardSearchModalOpen } = useUIState()
const { metaSymbol } = useShortcuts()
const { loggedIn, user, clear } = useUserSession()
const router = useRouter();

const items = computed(() => [
  [{
    slot: 'account',
    label: '',
    disabled: true
  }], [{
    label: 'Raccourcis',
    icon: 'i-heroicons-command-line',
    shortcuts: [metaSymbol.value, 'K'],
    click: () => {
      isDashboardSearchModalOpen.value = true
    }
  }], [{
    label: 'Déconnexion',
    icon: 'i-heroicons-arrow-left-on-rectangle',
    click: () => {
      clear()
      router.push('/login')
    }
  }]
])
</script>

<template>
  <UDropdown mode="hover" :items="items" :ui="{ width: 'w-full', item: { disabled: 'cursor-text select-text' } }"
    :popper="{ strategy: 'absolute', placement: 'top' }" class="w-full">
    <template #default="{ open }">
      <UButton color="gray" variant="ghost" class="w-full" :label="user?.firstname"
        :class="[open && 'bg-gray-50 dark:bg-gray-800']">
        <template #leading>
          <UAvatar :src="user?.picture" size="2xs" />
        </template>

        <template #trailing>
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-5 h-5 ml-auto" />
        </template>
      </UButton>
    </template>

    <template #account>
      <div class="text-left">
        <p>
          Connecté en tant que
        </p>
        <p class="truncate font-medium text-gray-900 dark:text-white">
          {{ user?.email }}
        </p>
      </div>
    </template>
  </UDropdown>
</template>
