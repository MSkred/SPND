<script lang="ts" setup>
import { object, string, number, boolean, type output } from "zod";
import type { FormSubmitEvent } from "#ui/types";
import { type Board } from "~/server/utils/drizzle";
import EmojiValidation from "~/utils/regexp";
const toast = useToast();

const props = defineProps<{
  board: Board;
}>();

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
  currency_id: number(),
  income: number().nonnegative().nullish(),
  objective: number().nonnegative(),
  start_date: string(),
  end_date: string().nullish(),
});

type Schema = output<typeof schema>;
import { format, setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
setDefaultOptions({ locale: fr });

const state = reactive({
  name: props.board.name,
  icon: props.board.icon,
  currency_id: props.board.currencyId,
  income: props.board.income,
  objective: props.board.objective,
  start_date: props.board.startDate,
  end_date: props.board.endDate,
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch(`/api/boards/${props.board.id}`, {
      method: "PUT",
      body: event.data,
    });
    toast.add({
      icon: "i-heroicons-check-circle",
      title: `Le tableau "${event.data.name}" a bien été modifié.`,
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
const { data: currencies } = await useFetch<Group[]>(`/api/currencies`, {
  deep: false,
  lazy: true,
  default: () => [],
});
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Nom du tableau" name="name" required>
      <UInput
        placeholder="ex: Japon, Janvier 24, Février 24, …"
        v-model="state.name"
      />
    </UFormGroup>
    <UFormGroup label="Icône du tableau" name="icon">
      <UInput placeholder="ex: 🇯🇵, 🥳, 🤡, …" v-model="state.icon" />
    </UFormGroup>
    <UFormGroup label="Devise" name="currency_id" required>
      <USelectMenu
        v-model="state.currency_id"
        searchable-placeholder="Sélection de la devise"
        :options="currencies"
        placeholder="Choix de la devise…"
        searchable
        value-attribute="id"
        option-attribute="isoCode"
        :search-attributes="['isoCode', 'symbol', 'name']"
      />
    </UFormGroup>
    <UFormGroup label="Entrée" name="income">
      <UInput type="number" placeholder="ex: 1800" v-model="state.income">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">€</span>
        </template>
      </UInput>
    </UFormGroup>
    <UFormGroup label="Objectif" name="objective" required>
      <UInput type="number" placeholder="ex: 50" v-model="state.objective">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">€</span>
        </template>
      </UInput>
    </UFormGroup>
    <UFormGroup label="Date de début" name="start_date" required>
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          icon="i-heroicons-calendar-days-20-solid"
          :label="
            state.start_date
              ? format(new Date(state.start_date), 'd MMM, yyy')
              : 'Choisissez une date de début'
          "
        />
        <template #panel="{ close }">
          <DatePicker v-model="state.start_date" is-required @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <UFormGroup
      label="Date de fin"
      name="end_date"
      help="Ce champ n'est pas obligatoire. Si vous ne rentrez aucune valeur le système ce basera sur la date du jour."
    >
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          icon="i-heroicons-calendar-days-20-solid"
          :label="
            state.end_date
              ? format(new Date(state.end_date), 'd MMM, yyy')
              : 'Choisissez une date de fin'
          "
        />
        <template #panel="{ close }">
          <DatePicker v-model="state.end_date" is-required @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <div class="flex flex-row justify-end">
      <UButton type="submit"> Modifier </UButton>
    </div>
  </UForm>
</template>
