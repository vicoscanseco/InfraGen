<template>
  <v-card class="mb-4" flat>
    <v-card-title class="text-subtitle-1 py-2">Configurar Function App</v-card-title>
    <v-card-text class="pt-2">
      <v-row dense>
        <v-col cols="12">
          <v-text-field 
            v-model="config.name" 
            label="Nombre del Function App" 
            placeholder="Ej: myfunctionapp" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required]"
            hint="Nombre único para el Function App"
            persistent-hint
          />
        </v-col>
      </v-row>
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

const rules = {
  required: value => !!value || 'Este campo es obligatorio'
}
</script>


