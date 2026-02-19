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

### Inicializar repositorio con git-flow
- Al clonar el repositorio por primera vez, se debe inicializar git-flow para configurar las ramas principales y convenciones.
- Solicitar al usuario que indique el tipo de proyecto (web, móvil, backend) para ajustar las convenciones de nombrado si es necesario (ej: `feature/agregar-login-web` vs `feature/agregar-login-backend`).
- Con la informacion del tipo de proyecto se debera de inizializar el proyecto con los archivos:
   - `README.md` con instrucciones específicas para ese tipo de proyecto, para ellos le puedes pedir al usuario que te de una breve descripción del proyecto y sus objetivos para personalizar el README.
   - `.gitignore` con las exclusiones comunes para ese tipo de proyecto. Si no queda claro el tipo de proyecto, le puedes pedir al usuario que te indique las tecnologías principales que va a usar (ej: Node.js, Python, Java) para generar un `.gitignore` adecuado.


#### Comando para inicializar git-flow con configuración por defecto:
```bash
git flow init -d
```

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

### Inicializar `hotfix/` — Corrección urgente
- **Origen:** `main` 
- **Destino (PR):** `main` y `develop`
- **Naming:** `hotfix/<descripcion-breve-en-kebab-case>`
#### Ejemplo:
```bash
# Crear hotfix branch
git checkout main
git pull origin main
git flow hotfix start fix-crash
```
### Finalizar `hotfix/` — Merge a main y develop
- Al finalizar un hotfix, se debe hacer merge a `main` para corregir el problema en producción, y luego a `develop` para mantener la corrección en el código base.
- **Nota:** Al igual que con features, se debe realizar el merge manualmente desde la interfaz de Azure DevOps para asegurar revisión de código y cumplimiento de estándares.





## Referencias
- [Git Flow Workflow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitIgnore Templates](https://github.com/github/gitignore)