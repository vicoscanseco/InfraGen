<template>
  <v-card class="pa-4 ma-4" max-width="600">
    <v-card-title>🧪 Test de Tooltips</v-card-title>
    <v-card-text>
      <div class="mb-4">
        <h3 class="mb-2">Estado actual de tooltips:</h3>
        <p class="text-body-2 mb-4">
          Los tooltips están implementados pero pueden no estar funcionando. 
          Prueba estos elementos:
        </p>
      </div>

      <v-row>
        <!-- Test 1: Tooltip simple -->
        <v-col cols="12" class="mb-3">
          <div class="text-subtitle-2 mb-2">1. Tooltip Simple:</div>
          <v-tooltip text="Este es un tooltip básico funcionando">
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" color="primary" variant="outlined">
                <v-icon left>mdi-help-circle</v-icon>
                Hover aquí para tooltip
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>

        <!-- Test 2: Tooltip condicional (como en AzureSelector) -->
        <v-col cols="12" class="mb-3">
          <div class="text-subtitle-2 mb-2">2. Tooltip Condicional (como componentes bloqueados):</div>
          <v-tooltip 
            text="Este componente está bloqueado porque ya tienes un SQL Server configurado"
            :disabled="false"
          >
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props" 
                color="grey" 
                disabled
                variant="outlined"
              >
                <v-icon left>mdi-lock</v-icon>
                Componente bloqueado
              </v-btn>
            </template>
          </v-tooltip>
        </v-col>

        <!-- Test 3: Tooltip en ícono (como botones de descarga) -->
        <v-col cols="12" class="mb-3">
          <div class="text-subtitle-2 mb-2">3. Tooltip en botones de descarga:</div>
          <v-btn-group variant="outlined" density="compact">
            <v-tooltip text="Descargar como archivo CSV (compatible con Excel)">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  prepend-icon="mdi-file-delimited"
                  color="green"
                >
                  CSV
                </v-btn>
              </template>
            </v-tooltip>
            <v-tooltip text="Descargar como archivo Excel (.xls)">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  size="small"
                  prepend-icon="mdi-microsoft-excel"
                  color="success"
                >
                  Excel
                </v-btn>
              </template>
            </v-tooltip>
          </v-btn-group>
        </v-col>

        <!-- Test 4: Tooltip con delay -->
        <v-col cols="12" class="mb-3">
          <div class="text-subtitle-2 mb-2">4. Tooltip con delay personalizado:</div>
          <v-tooltip 
            text="Tooltip con 300ms de delay de apertura"
            open-delay="300"
            close-delay="100"
          >
            <template v-slot:activator="{ props }">
              <v-chip v-bind="props" color="info" variant="outlined">
                <v-icon left>mdi-clock</v-icon>
                Tooltip con delay
              </v-chip>
            </template>
          </v-tooltip>
        </v-col>

        <!-- Test 5: Tooltip en campo de texto -->
        <v-col cols="12" class="mb-3">
          <div class="text-subtitle-2 mb-2">5. Tooltip en campo de entrada:</div>
          <v-tooltip text="Introduce un nombre descriptivo para tu aplicación Azure">
            <template v-slot:activator="{ props }">
              <v-text-field
                v-bind="props"
                label="Nombre de la aplicación"
                prepend-icon="mdi-application"
                variant="outlined"
                density="compact"
                hint="Debe ser único en Azure"
                persistent-hint
              />
            </template>
          </v-tooltip>
        </v-col>
      </v-row>

      <!-- Diagnóstico -->
      <v-divider class="my-4"></v-divider>
      
      <v-alert type="info" variant="tonal" class="mb-3">
        <template v-slot:prepend>
          <v-icon>mdi-information</v-icon>
        </template>
        <div class="text-body-2">
          <strong>Diagnóstico:</strong> Si no ves tooltips al hacer hover, puede ser debido a:
          <ul class="mt-2">
            <li>Configuración de Vuetify incompleta</li>
            <li>CSS que interfiere con los tooltips</li>
            <li>JavaScript deshabilitado</li>
            <li>Versión incompatible de Vuetify</li>
          </ul>
        </div>
      </v-alert>

      <!-- Soluciones -->
      <v-alert type="warning" variant="tonal">
        <template v-slot:prepend>
          <v-icon>mdi-wrench</v-icon>
        </template>
        <div class="text-body-2">
          <strong>Posibles soluciones:</strong>
          <ol class="mt-2">
            <li>Verificar que Vuetify esté correctamente configurado en main.js</li>
            <li>Asegurar que todos los componentes y directivas estén importados</li>
            <li>Comprobar conflictos de CSS con z-index</li>
            <li>Verificar la versión de Vuetify en package.json</li>
          </ol>
        </div>
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'TooltipTest'
}
</script>

<style scoped>
/* Estilos específicos para testing */
.v-tooltip {
  z-index: 9999 !important;
}
</style>
