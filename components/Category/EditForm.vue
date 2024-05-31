<script lang="ts" setup>
import { object, string, type output } from "zod";
import type { FormSubmitEvent } from "#ui/types";
const toast = useToast();
import RegExp from "~/utils/regexp";

const props = defineProps<{
  category: Category;
}>();

const emits = defineEmits<{
  close: [];
}>();

const schema = object({
  name: string({ message: "Obligatoire" }).min(2, {
    message: "Le nom doit faire minimum 2 caractères",
  }),
  icon: string().regex(RegExp().EmojiValidation, { message: "Doit être un emoji" })
});

type Schema = output<typeof schema>;

const state = reactive({
  key: props.category.name,
  icon: props.category.icon,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch(`/api/categories/${props.category.id}`, {
      method: "PUT",
      body: event.data,
    });
    toast.add({
      icon: "i-heroicons-check-circle",
      title: `La catégorie "${event.data.name}" a bien été modifiée.`,
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
    <UFormGroup label="Nom de la catégorie" name="name" required>
      <UInput
        placeholder="ex: Alimentation, Transport, Shopping, …"
        v-model="state.key"
      />
    </UFormGroup>
    <UFormGroup label="Icône de la catégorie" name="icon" required>
      <UInput placeholder="ex: 🍔, 🚎, 🛍️, …" v-model="state.icon" />
    </UFormGroup>
    <div class="flex flex-row justify-end">
      <UButton type="submit"> Modifier </UButton>
    </div>
  </UForm>
</template>
