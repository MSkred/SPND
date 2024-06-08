<script setup lang="ts">
const router = useRouter()
const { user } = useUserSession();
const { data: groups, refresh, pending } = await useFetch<Group[]>(`/api/groups/byUser/${user.value.id}`, {
  deep: false,
  lazy: true,
  default: () => [],
})
router.push(`?group=${groups.value[0].id}`)

const list = groups.value.map((el, i) => {
  return {
    label: el.name,
    click: () => {
      group.value = groups.value[i];
      router.push(`?group=${el.id}`)
    }
  }
})

const actions = [{
  label: 'Créer un groupe',
  icon: 'i-heroicons-plus-circle',
}, {
  label: 'Gérer les groupes',
  icon: 'i-heroicons-cog-8-tooth',
}]

const group = ref(groups.value[0])
</script>

<template>
  <UDropdown v-slot="{ open }" mode="hover" :items="[list, actions]" class="w-full" :ui="{ width: 'w-full' }"
    :popper="{ strategy: 'absolute' }">
    <UButton color="gray" variant="ghost" :class="[open && 'bg-gray-50 dark:bg-gray-800']" class="w-full">
      <h1>{{ group.name }}</h1>
    </UButton>
  </UDropdown>
</template>