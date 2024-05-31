
<!-- const data: DataRecord[] = [
  { key: 'names', value: 1396 },
  { key: 'cool', value: 928 },
  { key: 'alphanumeric', value: 864 },
  { key: 'fluffy', value: 518 },
  { key: 'nerdy', value: 294 },
  { key: 'other', value: 916 },
] -->
<script setup lang="ts">
import { VisSingleContainer, VisDonut, VisBulletLegend, VisTooltip } from '@unovis/vue'
import { Donut } from '@unovis/ts'

const props = defineProps({
  data: {
    type: Array<any>,
    required: true
  },
  label: {
    type: String, 
    required: true
  }
})
const triggers = {
  [Donut.selectors.segment]: d => {
    return `${d.data.icon ? d.data.icon + ' ' : ''}${d.data.key}: ${d.value.toFixed(2)}€`
  }
}
const sortFunction = (a, b) => a - b

const legendItems = Object.entries(props.data).map(([_, d]) => ({
    name: d.key.charAt(0).toUpperCase() + d.key.slice(1),
  }))
</script>

<template>
  <!-- <VisBulletLegend :items="legendItems"/> -->
  <VisSingleContainer>
    <VisTooltip :triggers="triggers" />
    <VisDonut
      :centralLabel="label + 's'" 
      :centralSubLabel="`Vos dépenses par ${label.toLowerCase()}`"
      :value="d => d.value"
      :data="data"
      :showEmptySegments="true"
      :padAngle="0.01"
      :arcWidth="50"
      :sortFunction="sortFunction"
    />
  </VisSingleContainer>
</template>