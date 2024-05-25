<script lang="ts" setup>
import { literal, object, string, type output } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
const route = useRoute()
const toast = useToast()

const emits = defineEmits<{
  close: []
}>()

const schema = object({
  name: string({ message: 'Obligatoire' }).min(2, { message: "Le nom doit faire minimum 2 caractères" }),
  icon: string().regex(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu, { message: 'Doit être un emoji' }).nullish(),
  color: string().nullish(),
})

type Schema = output<typeof schema>

const state = reactive({
  name: undefined,
  color: undefined,
  icon: undefined,
  group_id: route.query.group
})
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/categories', {
      method: 'POST',
      body: event.data,
    })
    toast.add({
      icon: 'i-heroicons-check-circle',
      title: `La catégorie "${event.data.name}" a bien été créée.`,
      color: 'green',
    })
    emits('close')
  }
  catch (e) {
    if (e instanceof Error) {
      console.error(e)
      toast.add({
        icon: 'i-heroicons-exclamation-circle',
        title: 'Veuillez réessayer',
        description: e.message,
        color: 'red',
      })
    }
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Nom de la catégorie" name="name" required>
      <UInput placeholder="ex: Alimentation, Transport, Shopping, …" v-model="state.name" />
    </UFormGroup>
    <UFormGroup label="Icône de la catégorie" name="icon">
      <UInput placeholder="ex: 🍔, 🚎, 🛍️, …" v-model="state.icon" />
    </UFormGroup>
    <UFormGroup label="Couleur" name="color">
      <UInput type="color" icon="i-heroicons-paint-brush-20-solid" v-model="state.color" />
    </UFormGroup>
    <div class="flex flex-row justify-end">
      <UButton type="submit">
        Créer
      </UButton>
    </div>
  </UForm>
</template>