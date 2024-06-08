<script lang="ts" setup>
import { number, object, string, type output } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import { type Group } from '~/server/utils/drizzle'

const props = defineProps<{
  group: Group
}>()
const toast = useToast()

const emits = defineEmits<{
  close: []
}>()

const schema = object({
  name: string({ message: 'Obligatoire' }).min(2, { message: "Le nom doit faire minimum 2 caractères" }),
  currency_id: number(),
})

type Schema = output<typeof schema>
const state = reactive({
  name: props.group.name,
  currency_id: props.group.currency_id
})
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch(`/api/groups/${props.group.id}`, {
      method: 'PUT',
      body: event.data,
    })
    toast.add({
      icon: 'i-heroicons-check-circle',
      title: `Le groupe "${event.data.name}" a bien été modifié.`,
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
const { data: currencies } = await useFetch<Group[]>(`/api/currencies`, {
  deep: false,
  lazy: true,
  default: () => [],
})
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Nom du groupe" name="name" required>
      <UInput placeholder="ex: Ménage, Tour du monde, …" v-model="state.name" />
    </UFormGroup>
    <UFormGroup label="Devise" name="currency_id" required>
      <USelectMenu
        v-model="state.currency_id"
        searchable-placeholder="Sélection de la devise"
        :options="currencies"
        placeholder="Choix de la devise…"
        value-attribute="id"
        searchable
        option-attribute="isoCode"
      />
    </UFormGroup>
    <div class="flex flex-row justify-end">
      <UButton type="submit">
        Modifier
      </UButton>
    </div>
  </UForm>
</template>