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
   - En caso de detectar ramas fuera de este modelo, se debe alertar al usuario y sugerir renombrar o eliminar ramas no conformes.
   - Se deben seguir las convenciones de nombrado para cada tipo de rama (ej: `feature/agregar-login`, `hotfix/fix-crash`).
   # Validar conformidad de ramas con git-flow
   ```
   git for-each-ref --format='%(refname:short)' refs/heads/ | while read branch; do
      if ! [[ "$branch" =~ ^(main|develop|feature/|fix/|hotfix/|release/|chore/).*$ ]]; then
         echo "⚠️  Rama no conforme con git-flow: $branch"
      fi
   done
   ```


## Ramas Principales

| Rama      | Propósito                            | Protegida | Des deployar a |
| --------- | ------------------------------------ | --------- | -------------- |
| `main`    | Código en producción estable         | ✅        | Producción     |
| `develop` | Integración de features en progreso  | ✅        | Staging        |

**Regla:** Nunca hacer commits directos a `main` ni a `develop`. Toda integración se hace vía Pull Request.

---

## Trabajando con ramas

### Inicializar `feature/` — Nueva funcionalidad
- **Origen:** `develop`
- **Destino (PR):** `develop`
- **Naming:** `feature/<descripcion-breve-en-kebab-case>`

#### Ejemplo:
```bash
# Crear feature branch
git checkout develop
git pull origin develop
git flow feature start agregar-cognitive-service-config
```

### Finalizar `feature/` — Merge a develop
- Si el feature esta terminado y probado entonces se le informa al Lider de Proyecto para que revise el código y apruebe el PR.
- No se ejecutan comandos de git-flow para finalizar, se hace merge manualmente desde la interfaz de Azure DevOps para asegurar revisión de código y cumplimiento de estándares.
- **Nota:** Debes avisarle al usuario de esto para que no intente finalizar con `git flow feature finish` y se le explique el proceso correcto de revisión y merge.




