<script setup lang="ts">

const props = defineProps({
  data: {
    type: Array<any>,
    required: true
  }
})
const total = ref(0)
props.data.map(el => {
  let v = el.value ? el.value : 0
  total.value += v
})
const divider = computed(() => total.value > 0 ?  (100 / total.value) : 100 )
const cat = computed(() => props.data.map(el => {
  return { ...el, percent: el.value * divider.value }
}))


watch(() => props.data, () => {
  total.value = 0
  props.data.map(el => {
    total.value += el.value
  })
});
</script>

<template>
  <div class="space-y-2">
    <UMeter
      v-for="(category, index) in cat.splice(0, 8)"
      :key="index"
      :value="category.percent"
      :label="(category.icon ? category.icon + ' ' : '') + category.key"
      color="black"
      size="lg"
      class="flex-row-reverse items-center"
      :ui="{ label: { base: 'flex-shrink-0 w-28' }, indicator: { container: '!w-auto' }, meter: { base: 'flex-1' } }"
      indicator
    />
  </div>
</template>