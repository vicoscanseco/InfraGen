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

## Archivos modificados

- `src/components/AzureSelector.vue`
- `src/App.vue`
- `src/style.css`
- `package.json`
- `vite.config.js`

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
- Distribución principal resultante:
  - `index-*.js`: ~`125 kB`
  - `vendor-vue-*.js`: ~`77.7 kB`
  - `vendor-vuetify-*.js`: ~`436 kB`
  - `vendor-vueflow-*.js`: ~`154.6 kB`

## Riesgos y mitigación

- Riesgo: cambios en timing de auto-guardado.
  - Mitigación: debounce corto + pruebas de interacción.
- Riesgo: efecto secundario en defaults de catálogo.
  - Mitigación: fallback explícito y validación al cargar JSON.

## Próximos pasos sugeridos

1. Extraer utilidades de persistencia a módulo dedicado para simplificar `AzureSelector`.
2. Aplicar lazy-loading también a configuradores poco frecuentes.
3. Definir estrategia de chunks en `vite.config.js` (manualChunks) para reducir warning > 500 kB.
4. Retirar o mover variantes legacy (`AzureSelector_clean.vue`, `AzureSelector_fixed.vue`) a carpeta de respaldo/documentación.
5. Crear Modulo para cargar una configuración ya generada anteriormente
6. Crear un modulo de administrador que permita: 
   1. Introducir las credenciales necesarias para Azure
   2. Seleccionar la suscripción 
   3. Seleccionar o crear un nuevo grupo de recursos
   4. Realizar la prueba de what-if del archivo bicep generado, preferentemente con Azure CLI o con el Azure REST API
   5. Realizar el deploy hacia esa suscripción del archivo bicep generado, preferentemente con Azure CLI o con el Azure REST API
