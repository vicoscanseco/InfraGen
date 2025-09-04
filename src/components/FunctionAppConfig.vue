<template>
  <v-card class="mb-4" flat>
    <v-card-title class="text-subtitle-1">Configurar Function App</v-card-title>
    <v-card-text>
      <v-text-field v-model="config.name" label="Nombre" placeholder="Nombre del recurso" density="comfortable" variant="outlined" class="mb-2" />
      <v-text-field v-model="config.resourceGroup" label="Grupo de recursos" placeholder="Nombre del grupo" density="comfortable" variant="outlined" />
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})
</script>


