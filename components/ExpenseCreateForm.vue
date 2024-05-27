<script lang="ts" setup>
import { object, string, number, boolean, type output, } from "zod";
import type { FormSubmitEvent } from "#ui/types";
const route = useRoute();
const toast = useToast();

const emits = defineEmits<{
  close: [];
}>();

const schema = object({
  name: string({ message: "Obligatoire" }).min(2, {
    message: "Le nom doit faire minimum 2 caractères",
  }),
  price: number().positive(),
  startDate: string(),
  endDate: string().nullish(),
  currency_id: string(),
  category_id: number({ coerce: true }),
  board_id: number({ coerce: true }),
  tag_id: number({ coerce: true }).nullish(),
});

type Schema = output<typeof schema>;
import { format, setDefaultOptions } from "date-fns";
import { fr } from "date-fns/locale";
import type { Board, Category, Currency, Tag } from "~/server/utils/drizzle";
setDefaultOptions({ locale: fr });
const boardId = ref<number | null>(null)
const groupId = ref(route.query.group)
const state = reactive({
  name: undefined,
  price: undefined,
  startDate: undefined,
  endDate: undefined,
  currency_id: null,
  category_id: undefined,
  board_id: boardId,
  tag_id: undefined,
  group_id: groupId,
});
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    await $fetch("/api/expenses", {
      method: "POST",
      body: event.data,
    });
    toast.add({
      icon: "i-heroicons-check-circle",
      title: `La dépense "${event.data.name}" a bien été créée.`,
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
// FETCH CURRENCIES
const { data: currencies, refresh: refreshCurrencies } = await useFetch<Currency[]>(`/api/currencies`, {
  query: { board: boardId, group: groupId},
  deep: false,
  lazy: true,
  default: () => [],
});
// FETCH CATEGORIES BY GROUP
const { data: categories } = await useFetch<Category[]>(`/api/categories?group=${route.query.group}`, {
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH TAGS BY GROUP
const { data: tags } = await useFetch<Tag[]>(`/api/tags?group=${route.query.group}`, {
  deep: false,
  lazy: true,
  default: () => [],
})
// FETCH BOARDS BY GROUP
const { data: boards } = await useFetch<Board[]>(`/api/boards?group=${route.query.group}`, {
  deep: false,
  lazy: true,
  default: () => [],
})
watch(() => state.board_id, () => {
  let find = boards.value.find(el => el.id === boardId.value)
  if (find) {
    state.currency_id = find!.currency_id;
  }
});
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormGroup label="Nom de la dépense" name="name" required>
      <UInput
        placeholder="ex: 7-eleven, Supermarché, Tuktuk vers aéroport, …"
        v-model="state.name"
      />
    </UFormGroup>
    <UFormGroup label="Tableau" name="board_id" required>
      <USelectMenu
        v-model="boardId"
        searchable-placeholder="Sélection du tableau"
        :options="boards"
        placeholder="Choix du tableau"
        value-attribute="id"
        searchable>
        <template #label>
          <span v-if="boardId">{{ boards.find(el => el.id === boardId).icon ? boards.find(el => el.id === boardId).icon + ' ' : '' }}{{ boards.find(el => el.id === boardId).name }}</span>
        </template>
        <template #option="{ option: category }">
          <span>{{ category.icon ? category.icon + ' ' : '' }}{{ category.name }}</span>
        </template>
      </USelectMenu>
    </UFormGroup>
    <UFormGroup label="Devise" name="currency_id" required>
      <USelectMenu
        v-model="state.currency_id"
        searchable-placeholder="Sélection de la devise"
        :options="currencies"
        placeholder="Choix de la devise…"
        value-attribute="isoCode"
        searchable
        option-attribute="isoCode"
      />
    </UFormGroup>
    <UFormGroup label="Montant" name="price">
      <UInput type="number" step="0.01" placeholder="ex: 15.08" v-model="state.price">
        <template #trailing>
          <span class="text-gray-500 dark:text-gray-400 text-xs">{{ state.currency_id }}</span>
        </template>
      </UInput>
    </UFormGroup>
    <UFormGroup label="Catégorie" name="category_id" required>
      <USelectMenu
        v-model="state.category_id"
        searchable-placeholder="Sélection de la catégorie"
        :options="categories"
        placeholder="Choix de la catégorie"
        value-attribute="id"
        searchable trailing>
        <template #label>
          <span v-if="state.category_id">{{ categories.find(el => el.id === state.category_id).icon ? categories.find(el => el.id === state.category_id).icon + ' ' : '' }}{{ categories.find(el => el.id === state.category_id).name }}</span>
        </template>
        <template #option="{ option: category }">
          <span>{{ category.icon ? category.icon + ' ' : '' }}{{ category.name }}</span>
        </template>
      </USelectMenu>
    </UFormGroup>
    <UFormGroup label="Tag" name="tag_id">
      <USelectMenu
        v-model="state.tag_id"
        searchable-placeholder="Sélection du tag"
        :options="tags"
        placeholder="Choix du tag"
        value-attribute="id"
        searchable>
        <template #label>
          <span v-if="state.tag_id">{{ tags.find(el => el.id === state.tag_id).icon ? tags.find(el => el.id === state.tag_id).icon + ' ' : '' }}{{ tags.find(el => el.id === state.tag_id).name }}</span>
        </template>
        <template #option="{ option: tag }">
          <span>{{ tag.icon ? tag.icon + ' ' : '' }}{{ tag.name }}</span>
        </template>
      </USelectMenu>
    </UFormGroup>
    <UFormGroup label="Date de début" name="startDate" required>
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          icon="i-heroicons-calendar-days-20-solid"
          :label="
            state.startDate
              ? format(state.startDate, 'd MMM, yyy')
              : 'Choisissez la date de la dépense'
          "
        />
        <template #panel="{ close }">
          <DatePicker v-model="state.startDate" is-required @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <UFormGroup label="Date de fin" name="endDate" help="Ce champ n'est pas obligatoire. Complétez le uniquement si vous souhaitez étendre la dépense (ex: Abonnement, nuits d'hôtel, etc…)">
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          icon="i-heroicons-calendar-days-20-solid"
          :label="
            state.endDate
              ? format(state.endDate, 'd MMM, yyy')
              : 'Étendre la dépense jusqu\'au'
          "
        />
        <template #panel="{ close }">
          <DatePicker v-model="state.endDate" is-required @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <div class="flex flex-row justify-end">
      <UButton type="submit"> Créer </UButton>
    </div>
  </UForm>
</template>
