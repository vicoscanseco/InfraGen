<template>
  <v-container class="py-8">
    <v-card class="mx-auto" max-width="900">
      <v-card-title class="text-h5">Vista de Arquitectura (Demo)</v-card-title>
      <v-card-text>
        <VueFlow :nodes="nodes" :edges="edges" fit-view style="height: 500px; background: #f8fafc;" />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, h } from 'vue'
import '@vue-flow/core/dist/style.css'
import { VueFlow } from '@vue-flow/core'

const props = defineProps({
  components: {
    type: Array,
    required: true
  }
})

const nodes = computed(() => {
  return props.components.map((comp, idx) => {
    const generatedName = comp.config?.name || ''
    return {
      id: String(idx + 1),
      // Usar un VNode para el label si hay nombre generado
      label: generatedName
        ? h('div', [
            h('div', comp.label),
            h('div', { style: 'font-size: 13px; color: #666; margin-top: 2px;' }, generatedName)
          ])
        : comp.label,
      type: 'default',
      position: { x: 100 + idx * 200, y: 200 }
    }
  })
})

const edges = computed(() => {
  const nodesArr = nodes.value
  const edgesArr = []
  // Buscar el primer AppServicePlan y SQLServer
  const aspIdx = props.components.findIndex(c => c.value === 'AppServicePlan')
  const sqlIdx = props.components.findIndex(c => c.value === 'SQLServer')
  // Relacionar AppService con AppServicePlan
  props.components.forEach((c, idx) => {
    if (c.value === 'AppService' && aspIdx !== -1) {
      edgesArr.push({
        id: `asp-${idx + 1}`,
        source: String(aspIdx + 1),
        target: String(idx + 1)
      })
    }
    if (c.value === 'SQLDatabase' && sqlIdx !== -1) {
      edgesArr.push({
        id: `sql-${idx + 1}`,
        source: String(sqlIdx + 1),
        target: String(idx + 1)
      })
    }
  })
  return edgesArr
})
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 1em;
  border-radius: 6px;
}
</style>
