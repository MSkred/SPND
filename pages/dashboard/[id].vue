<template>
  <main>
    <UHeader>
      <template #logo>
        <h1>SPND</h1>
      </template>
      <template #right>
        <UColorModeButton />
        <UButton v-if="loggedIn" @click="clear; router.push('/login');"
          icon="i-heroicons-arrow-left-start-on-rectangle-20-solid" color="gray" variant="ghost" />
        <UButton v-else to="/login" icon="i-heroicons-arrow-left-on-rectangle-20-solid" color="gray" variant="ghost" />
      </template>
    </UHeader>
    <h2>Dashboard of user id {{ route.params.id }}</h2>
    <p v-for="(item, key) in categories" :key="key">{{ item }}</p>
  </main>
</template>

<script setup lang="ts">
import { type Groups } from '~/server/utils/drizzle'
const router = useRouter();
const route = useRoute();
const { loggedIn, clear } = useUserSession()

useSeoMeta({
  title: 'Dashboard',
})
const { data: categories, refresh, pending } = await useFetch<Groups[]>(`/api/users/${route.params.id}/groups`, {
  deep: false,
  lazy: true,
  default: () => [],
})

</script>