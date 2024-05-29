<script setup lang="ts">
import { StackedBar } from '@unovis/ts';
import { VisXYContainer, VisTooltip, VisStackedBar, VisAxis } from '@unovis/vue'

const props = defineProps<{ data: any[] }>()
const b = props.data.map((el, index) => {
  return {
    x: index,
    y: el.value,
    name: el.key,
    icon: el.icon
  }
})

const bars = ref(b)
const x = (d: any) => {
  return d.x
}
const y = (d: any) => {
  return d.y
}

function xTickFormat(i: number) {
  let name = bars.value[i].name
  return name.substr(0, 4) + ( name.length > 4 ? '.' : '' )
}
const triggers = {
  [StackedBar.selectors.bar]: (d: any) => {
    return `${d.icon ? d.icon + ' ' : ''}${d.name}: ${d.y}€`
  }
}
const colors = ['#4ade80']
</script>

<template>
  <VisXYContainer :data="bars">
    <VisStackedBar :x="x" :y="y" :color="colors"/>
    <VisTooltip :triggers="triggers" />
    <VisAxis type="x" label="Catégories" :numTicks="bars.length" :tickFormat="xTickFormat" tickTextAlign="center"/>
    <VisAxis type="y" label="Prix (€)"/>
  </VisXYContainer>
</template>



