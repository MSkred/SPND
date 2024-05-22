<template>
  <main>
    <UHeader>
      <template #logo>
        <h1>Spnd</h1>
      </template>
      <template #right>
        <UColorModeButton />
        <UButton v-if="loggedIn" @click="clear; router.push('/login');" icon="i-heroicons-arrow-left-start-on-rectangle-20-solid" color="gray" variant="ghost" />
        <UButton v-else to="/login" icon="i-heroicons-arrow-left-on-rectangle-20-solid" color="gray" variant="ghost" />
      </template>
    </UHeader>
    <h1>hello guys !</h1>
  </main>
</template>

<script setup lang="ts">
const router = useRouter();
const { loggedIn, clear } = useUserSession()
</script>