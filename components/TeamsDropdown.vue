<script setup lang="ts">
// const groups = [{
//   label: 'Nuxt',
//   avatar: {
//     src: 'https://avatars.githubusercontent.com/u/23360933?s=200&v=4'
//   },
//   click: () => {
//     group.value = groups[0]
//   }
// }, {
//   label: 'NuxtLabs',
//   avatar: {
//     src: 'https://avatars.githubusercontent.com/u/62017400?s=200&v=4'
//   },
//   click: () => {
//     group.value = groups[1]
//   }
// }]

const { user } = useUserSession();
const { data: categories, refresh, pending } = await useFetch<Group[]>(`/api/users/${user.value.id}/groups`, {
  deep: false,
  lazy: true,
  default: () => [],
})

const list = categories.value.map(el => {
  return { label: el.name }
})
console.log('list ', list);
const actions = [{
  label: 'Créer un groupe',
  icon: 'i-heroicons-plus-circle'
}, {
  label: 'Gérer les groupes',
  icon: 'i-heroicons-cog-8-tooth'
}]

const category = ref(categories.value[0])
</script>

<template>
  <UDropdown v-slot="{ open }" mode="hover" :items="[list, actions]" class="w-full" :ui="{ width: 'w-full' }"
    :popper="{ strategy: 'absolute' }">
    <UButton color="gray" variant="ghost" :class="[open && 'bg-gray-50 dark:bg-gray-800']" class="w-full">
      <h1>{{ category.name }}</h1>
    </UButton>
  </UDropdown>
</template>