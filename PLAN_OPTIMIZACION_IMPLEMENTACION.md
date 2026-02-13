# Plan de Optimización e Implementación (Quick Wins)

## Contexto

- Proyecto: InfraGen
- Rama: `feature/Refactor`
- Objetivo: mejorar mantenibilidad y rendimiento inicial con cambios de bajo/medio riesgo.
- Horizonte: 1-2 días.

## Criterios de éxito

- Reducir complejidad reactiva y escrituras redundantes en `localStorage`.
- Evitar carga innecesaria de vistas pesadas en el arranque.
- Eliminar estilos heredados que afectan layout global en Vuetify.
- Verificar build y smoke test de pricing sin regresiones.

## Fase 1 — Baseline (Completado)

- Build baseline registrado:
  - Tiempo de build aproximado: `4.42s`
  - Warning de chunk > `500 kB` presente
- Calidad actual:
  - Sin errores de editor detectados.

## Fase 2 — Implementación inicial (Completado)

### 2.1 Selector canónico y carga diferida

- Se mantiene flujo único en la app raíz (`AzureSelector` como componente principal).
- `ArchitectureView` ahora se carga con `defineAsyncComponent` para reducir carga inicial.

### 2.2 Optimización reactiva y persistencia

- Auto-guardado con `debounce` (`500ms`) para evitar escrituras por cada cambio mínimo.
- Separación de watchers:
  - Campos simples: watcher sin `deep`.
  - Componentes configurados: watcher con `deep`.
- Se agregó pausa controlada de auto-save durante:
  - Hidratación desde `localStorage`.
  - Limpieza/reset del formulario.
- Se corrige el caso donde limpiar `localStorage` podía volver a guardar inmediatamente.

### 2.3 Normalización de catálogos

- Validación del ambiente y ubicación por defecto contra los catálogos cargados.
- Fallback al primer valor disponible cuando el valor actual no existe en catálogo.

### 2.4 Higiene de estilos globales

- Eliminación de estilos base heredados de plantilla Vite que interferían con Vuetify:
  - `body` con centrado forzado
  - `#app` con `max-width`/padding heredado
  - reglas globales de botones/enlaces no necesarias
- Se mantienen estilos de tooltip existentes.

### 2.5 Script de verificación

- Se agregó script npm `test:pricing`.

### 2.6 Extracción de persistencia (Completado)

- Se movió la lógica de `localStorage` a `src/utils/configPersistence.js`.
- `AzureSelector.vue` ahora consume el módulo `useInfragenConfigPersistence`.
- Se redujo complejidad del componente sin cambiar flujo funcional.
- Validación posterior: `npm run build` y `npm run test:pricing` en verde.

### 2.7 Lazy-loading de configuradores (Completado)

- Se migraron los configuradores del diálogo dinámico a `defineAsyncComponent` en `AzureSelector.vue`.
- Se generaron chunks separados por configurador para mejorar carga inicial.
- Validación posterior: `npm run build` y `npm run test:pricing` en verde.

### 2.8 Retiro de variantes legacy (Completado)

- Se retiraron `AzureSelector_clean.vue` y `AzureSelector_fixed.vue` por no estar en uso.
- Se dejó registro en `LEGACY_COMPONENTES.md`.
- Se mantiene `AzureSelector.vue` como selector canónico.

### 2.9 Importación de configuración desde Bicep (Completado)

- Se creó el parser `src/utils/bicepImportParser.js` para interpretar Bicep generado por InfraGen.
- Se integró el botón **Importar Bicep** en `AzureSelector.vue`.
- Al importar, se reconstruyen campos base y componentes editables para continuar trabajando.
- Validación posterior: `npm run build` y `npm run test:pricing` en verde.

### 2.10 Módulo administrador de despliegue Azure (Completado)

- Se creó `src/components/AzureDeploymentManager.vue`.
- Se integró en `AzureSelector.vue` con datos del Bicep actual, ubicación y grupo de recursos.
- Permite:
  - Definir credenciales (Azure CLI o Service Principal).
  - Seleccionar suscripción.
  - Elegir grupo de recursos existente o crear nuevo.
  - Generar comandos de `what-if` y `deploy` por Azure CLI.
  - Generar referencia equivalente para Azure REST API.
- Validación posterior: `npm run build` y `npm run test:pricing` en verde.

## Archivos modificados

- `src/components/AzureSelector.vue`
- `src/App.vue`
- `src/style.css`
- `package.json`
- `vite.config.js`
- `src/utils/configPersistence.js`

## Fase 3 — Validación (Completado)

- Ejecutado `manualChunks` en `vite.config.js` para separar vendors (`vue`, `vuetify`, `mdi`, `vue-flow`).

- Ejecutar:
  - `npm run build`
  - `npm run test:pricing`
- Confirmar:
  - No regresiones funcionales en flujo principal.
  - Persistencia/restauración/limpieza funcionando correctamente.
  - Warning de tamaño de chunk no empeora.

### Resultado de métricas

- Baseline inicial: `4.42s` con warning de chunk > `500 kB`.
- Build tras quick wins previos: `3.31s` (warning aún presente).
- Build tras `manualChunks`: `4.08s` y **sin warning** de chunk > `500 kB`.
- Build tras lazy-loading de configuradores: `2.53s` y reducción del chunk principal a ~`62.09 kB`.
- Distribución principal resultante:
  - `index-*.js`: ~`62.09 kB`
  - `vendor-vue-*.js`: ~`77.7 kB`
  - `vendor-vuetify-*.js`: ~`436 kB`
  - `vendor-vueflow-*.js`: ~`154.6 kB`

## Riesgos y mitigación

- Riesgo: cambios en timing de auto-guardado.
  - Mitigación: debounce corto + pruebas de interacción.
- Riesgo: efecto secundario en defaults de catálogo.
  - Mitigación: fallback explícito y validación al cargar JSON.

## Próximos pasos sugeridos

1. El modulo de administración para la conexion con Azure, debe ser una ventana separada y para ingresar a esta debe entrar con un usuario y password.
2. Ejecutar despliegue real desde backend seguro (no desde frontend) usando Azure SDK/CLI.
3. Enmascarar y gestionar secretos con Key Vault o variables seguras en CI/CD.
4. Agregar historial de operaciones (what-if/deploy) y bitácora de resultados.
5. Estandarizar componentes a TypeScript (`<script setup lang="ts">`) de forma gradual por lotes pequeños y con `vue-tsc` en CI (pendiente por ahora).
