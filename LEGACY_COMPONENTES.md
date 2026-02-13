# Componentes Legacy Retirados

Se retiraron del árbol activo los siguientes componentes legacy por no estar referenciados por la aplicación:

- `src/components/AzureSelector_clean.vue`
- `src/components/AzureSelector_fixed.vue`

## Motivo

- Reducir deuda técnica.
- Evitar confusión sobre el selector canónico.
- Mantener una sola implementación activa: `src/components/AzureSelector.vue`.

## Recuperación

Si necesitas revisar o restaurar estas variantes, puedes obtenerlas desde el historial de Git de la rama.
