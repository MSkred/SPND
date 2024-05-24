<script lang="ts" setup>
import { object, string, type output } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const toast = useToast()

const emits = defineEmits<{
  close: []
}>()

const schema = object({
  name: string({ message: 'Obligatoire' }),
})

type Schema = output<typeof schema>

const state = reactive({
  name: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch('/api/groups', {
      method: 'POST',
      body: event.data,
    })
    toast.add({
      icon: 'i-heroicons-check-circle',
      title: `Le groupe "${event.data.name}" a bien été créé.`,
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
    <UFormGroup label="Nom du group" name="name">
      <UInput placeholder="ex: Ménage, Tour du monde, …" v-model="state.name" />
    </UFormGroup>

    <div class="flex flex-row justify-end">
      <UButton type="submit">
        Créer
      </UButton>
    </div>
  </UForm>
</template>