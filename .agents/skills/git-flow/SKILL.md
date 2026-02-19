---
name: git-flow
description: Use when working with branches, commits, pull requests, releases, or any Git workflow operation in this repository. Covers branch naming conventions, commit message standards, PR creation, merge strategies, and version tagging.
---

# Git Flow

## Resumen

Guía de flujo de trabajo Git para los repositorios. Define convenciones de ramas, mensajes de commit, pull requests y estrategia de versiones basada en Git Flow + Conventional Commits.

---
## Requisitos

1. **git-flow**: El ambiente de desarrollo debe tener instalado git-flow.
  - Instrucciones de instalación:
    - **Windows**: Usar Git Bash y ejecutar `git flow init -d` para configurar.
    - **macOS/Linux**: Instalar vía Homebrew (`brew install git-flow`) o gestor de paquetes correspondiente.
2. **branches**: Se debe validar que el repositorio siga el modelo de ramas definido (main, develop, feature/, fix/, hotfix/, release/, chore/).


## Ramas Principales

| Rama      | Propósito                            | Protegida | Des deployar a |
| --------- | ------------------------------------ | --------- | -------------- |
| `main`    | Código en producción estable         | ✅        | Producción     |
| `develop` | Integración de features en progreso  | ✅        | Staging        |

**Regla:** Nunca hacer commits directos a `main` ni a `develop`. Toda integración se hace vía Pull Request.

---

## Tipos de Ramas de Trabajo

### `feature/` — Nueva funcionalidad
- **Origen:** `develop`
- **Destino (PR):** `develop`
- **Naming:** `feature/<descripcion-breve-en-kebab-case>`

```bash
# Crear feature branch
git checkout develop
git pull origin develop
git checkout -b feature/agregar-cognitive-service-config
```

### `fix/` — Corrección de bug no urgente
- **Origen:** `develop`
- **Destino (PR):** `develop`
- **Naming:** `fix/<descripcion-del-bug>`

```bash
git checkout -b fix/corregir-calculo-costo-storage
```

### `hotfix/` — Corrección urgente en producción
- **Origen:** `main`
- **Destino (PR):** `main` **y** `develop`
- **Naming:** `hotfix/<descripcion-urgente>`

```bash
git checkout main
git pull origin main
git checkout -b hotfix/fix-bicep-generation-crash
```

### `release/` — Preparación de versión
- **Origen:** `develop`
- **Destino (PR):** `main` **y** `develop`
- **Naming:** `release/<version>` (ej: `release/2.1.0`)

```bash
git checkout develop
git checkout -b release/2.1.0
```

### `chore/` — Tareas de mantenimiento (no funcionalidad)
- **Origen:** `develop`
- **Destino (PR):** `develop`
- **Naming:** `chore/<tarea>`

```bash
git checkout -b chore/actualizar-dependencias-npm
```

---

## Convenciones de Commit

Sigue el estándar **Conventional Commits** (`<tipo>(scope): descripción`).

### Tipos Permitidos

| Tipo       | Cuándo usarlo                                   | Impacto versión |
| ---------- | ----------------------------------------------- | --------------- |
| `feat`     | Nueva funcionalidad                             | MINOR           |
| `fix`      | Corrección de bug                               | PATCH           |
| `docs`     | Solo documentación                              | -               |
| `style`    | Formato, espacios (sin cambio de lógica)        | -               |
| `refactor` | Refactor sin nuevas features ni fixes           | -               |
| `perf`     | Mejora de rendimiento                           | PATCH           |
| `test`     | Añadir o corregir tests                         | -               |
| `chore`    | Cambios de build, CI, dependencias              | -               |
| `revert`   | Revertir commit anterior                        | -               |

### Scopes Recomendados para InfraGen

| Scope           | Descripción                         |
| --------------- | ----------------------------------- |
| `bicep`         | Generador de código Bicep           |
| `selector`      | Componente AzureSelector            |
| `config`        | Cualquier componente `*Config.vue`  |
| `pricing`       | Utils de precios Azure              |
| `ui`            | Cambios visuales / estilos          |
| `wizard`        | InfraWizard                         |
| `deploy`        | AzureDeploymentManager              |
| `docs`          | Documentación                       |
| `deps`          | Dependencias                        |

### Ejemplos Correctos

```
feat(bicep): agregar soporte para Container Apps con variables de entorno
fix(pricing): corregir cálculo de costo mensual para SQL Database Standard
docs: actualizar README con instrucciones de despliegue
chore(deps): actualizar vuetify a 3.4.0
refactor(selector): extraer lógica de validación a composable
feat(config)!: cambiar estructura de props en StorageAccountConfig
```

> **Nota:** El `!` después del scope indica un **BREAKING CHANGE** (incrementa versión MAJOR).

### Formato del Cuerpo (opcional pero recomendado)

```
feat(bicep): agregar soporte para Cognitive Services

Agrega generación de código Bicep para Azure Cognitive Services incluyendo:
- Configuración de tier (Free, Standard, Premium)
- Soporte para múltiples tipos de cuenta
- Referencia automática al Resource Group existente

Closes #42
```

---

## Flujo Completo: Feature

```
1. Crear rama desde develop
   git checkout develop && git pull origin develop
   git checkout -b feature/mi-nueva-feature

2. Desarrollar + commits frecuentes
   git add .
   git commit -m "feat(scope): descripción breve"

3. Mantener rama actualizada
   git fetch origin
   git rebase origin/develop   # preferir rebase sobre merge

4. Push y abrir PR
   git push -u origin feature/mi-nueva-feature
   → Abrir PR hacia develop en GitHub

5. Review, CI, aprobación

6. Merge con Squash (recomendado para features)
   → Squash and merge en GitHub UI

7. Eliminar rama remota después del merge
```

---

## Flujo Completo: Hotfix

```
1. Crear rama desde main
   git checkout main && git pull origin main
   git checkout -b hotfix/descripcion

2. Fix + commit
   git commit -m "fix(scope): corregir problema crítico en producción"

3. PR → main con aprobación urgente

4. Después de merge a main:
   - Crear tag de versión PATCH (ej: v1.2.1)
   - Abrir PR separado de main → develop para sincronizar el fix
```

---

## Pull Requests

### Título del PR
Debe seguir el mismo formato de Conventional Commits:
```
feat(bicep): agregar soporte para Function Apps con slots de staging
```

### Checklist Mínimo

```markdown
## Descripción
<!-- Qué hace este PR y por qué -->

## Cambios
- [ ] Funcionalidad implementada
- [ ] Tests actualizados/añadidos (si aplica)
- [ ] Documentación actualizada (README, CHANGELOG)
- [ ] Sin console.log / código de debug

## Tipo de cambio
- [ ] feat: Nueva funcionalidad
- [ ] fix: Corrección de bug
- [ ] refactor: Refactor sin cambio de comportamiento
- [ ] chore: Mantenimiento

## Testing
<!-- Pasos para probar manualmente -->
```

### Estrategia de Merge

| Tipo de rama | Estrategia recomendada |
| ------------ | ---------------------- |
| `feature/`   | **Squash and merge**   |
| `fix/`       | **Squash and merge**   |
| `hotfix/`    | **Merge commit**       |
| `release/`   | **Merge commit**       |
| `chore/`     | **Squash and merge**   |

---

## Versionado Semántico (SemVer)

Formato: `MAJOR.MINOR.PATCH` — Ejemplo: `v1.3.2`

| Incremento | Cuándo                                  | Ejemplo          |
| ---------- | --------------------------------------- | ---------------- |
| `MAJOR`    | Breaking change (`feat!` / `fix!`)      | `v1.0.0 → v2.0.0` |
| `MINOR`    | Nueva funcionalidad compatible (`feat`) | `v1.2.0 → v1.3.0` |
| `PATCH`    | Bug fix compatible (`fix`, `perf`)      | `v1.2.0 → v1.2.1` |

### Crear Tag de Versión

```bash
# Después de merge a main
git checkout main && git pull origin main
git tag -a v1.3.0 -m "feat(bicep): soporte para Container Apps y Function Apps"
git push origin v1.3.0
```

---

## Ramas y Estado Actual del Proyecto

- **Rama activa de desarrollo:** `feature/v2`
- **Rama principal:** `main`
- **Siguiente versión esperada:** `v2.0.0` (breaking changes por rediseño de arquitectura)

---

## Errores Comunes

| Error | Solución |
|-------|----------|
| Commit directo a `main` | Revertir con `git revert`, abrir PR para reaplicar |
| Mensajes de commit sin tipo | Usar `git commit --amend` antes de push |
| PR hacia `main` directamente (feature) | Cambiar base del PR a `develop` en GitHub |
| Rama sin actualizar desde develop | `git rebase origin/develop` antes del PR |
| Olvidar sincronizar hotfix a develop | Abrir PR manual de `main → develop` tras el hotfix |
