# Changelog

Todos los cambios relevantes de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [1.1.0] - 2026-02-13

> Incluye los cambios integrados durante ayer y hoy (2026-02-12 a 2026-02-13) en la rama `feature/v2`.

### Añadido

- Módulo `AzureDeploymentManager` integrado al flujo principal para preparar autenticación, selección de suscripción/grupo de recursos y comandos de despliegue (`what-if`/`deploy`).
- Importación de configuración desde Bicep mediante `bicepImportParser`, permitiendo reconstruir componentes editables desde archivos existentes.
- Skill de automatización de changelog y documentación de agentes/guías para estandarizar prácticas de release y desarrollo.
- Guía de despliegue en Azure con alternativas de publicación (Static Web Apps, App Service y Storage Account).
- Primeras bases de validación y pruebas automatizadas enfocadas en generación/validación de Bicep.

### Cambiado

- Refactor importante de componentes Vue a `script setup`, incluyendo `CostEstimator`, `SqlDatabaseConfig`, `FunctionAppConfig`, `StorageAccountConfig`, `AppServiceConfig` y componentes auxiliares.
- Mejora del rendimiento y mantenibilidad: lazy loading de vistas/configuradores, debounce en auto-guardado y extracción de persistencia a `configPersistence`.
- Rediseño y compactación de UI en `AzureSelector` y `CostEstimator`: acciones en header, modales, tarjetas por categoría y consistencia visual general.
- Soporte de tema oscuro y refinamiento de paletas/contrastes (incluyendo ajuste hacia paleta tipo GitHub), con mejoras de accesibilidad visual.
- Estandarización visual de iconografía y colores por categoría en paneles de componentes disponibles/configurados/costos.
- Ajustes de nomenclatura de ambiente (`Staging` → `Calidad` / `qa`) en datos y documentación relacionada.
- Campo de tamaño máximo de SQL Database actualizado de bytes a GB en UI, manteniendo compatibilidad interna con `maxSizeBytes` para generación de Bicep.
- Mejoras de legibilidad en estimación de costos: total mensual, formato compacto de región, espaciados y microinteracciones.

### Corregido

- Corrección de enlaces en instrucciones de Copilot y ajustes del plan de implementación.
- Correcciones de coherencia visual en bloque de total de costos (símbolo de moneda duplicado, padding/alineación y texto de periodicidad).
- Corrección de consistencia en estilos de subtítulos y etiquetas secundarias en lista de costos.

## [Unreleased]

### Pendiente

- Suite mínima de pruebas para reglas críticas (naming por ambiente/región, conversiones y generación de Bicep).
- Validación automática del Bicep previo a exportación/despliegue.
- Esquema único de defaults/validaciones para reducir reglas duplicadas.
- Pruebas de ida y vuelta en importación/exportación.
- Pase final de accesibilidad UX (foco en teclado, mensajes de error y contraste dark).
- Estandarización gradual a TypeScript (`<script setup lang="ts">`) con `vue-tsc` en CI.

[1.1.0]: https://github.com/vicoscanseco/InfraGen
[Unreleased]: https://github.com/vicoscanseco/InfraGen/compare/main...feature/v2
