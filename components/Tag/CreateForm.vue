<script lang="ts" setup>
import { object, string, type output } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import EmojiValidation from "~/utils/regexp";
const route = useRoute();
const toast = useToast();

const emits = defineEmits<{
  close: [];
}>();

const schema = object({
  name: string({ message: "Obligatoire" }).min(2, {
    message: "Le nom doit faire minimum 2 caractères",
  }),
  icon: string()
    .regex(EmojiValidation, { message: "Doit être un emoji" })
    .nullish(),
});

type Schema = output<typeof schema>;

const state = reactive({
  name: undefined,
  icon: undefined,
  group_id: route.query.group,
});
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch("/api/tags", {
      method: "POST",
      body: event.data,
    });
    toast.add({
      icon: "i-heroicons-check-circle",
      title: `Le tag "${event.data.name}" a bien été créée.`,
      color: "green",
    });
    emits("close");
  } catch (e) {
    if (e instanceof Error) {
      console.error(e);
      toast.add({
        icon: "i-heroicons-exclamation-circle",
        title: "Veuillez réessayer",
        description: e.message,
        color: "red",
      });
    }
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Nom du tag" name="name" required>
      <UInput
        placeholder="ex: Tokyo, Déménagment, Anniversaire, …"
        v-model="state.name"
      />
    </UFormGroup>
    <UFormGroup label="Icône du tag" name="icon">
      <UInput placeholder="ex: 🏯, 📦, 🎂, …" v-model="state.icon" />
    </UFormGroup>
    <div class="flex flex-row justify-end">
      <UButton type="submit"> Créer </UButton>
    </div>
  </UForm>
</template>
