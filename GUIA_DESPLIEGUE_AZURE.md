# Guía de Despliegue de InfraGen en Azure

Esta guía resume qué necesitas crear en Azure para publicar esta aplicación Vue/Vite.

## Recomendación rápida

- Si solo quieres hospedar la UI (frontend SPA): usa Azure Static Web Apps.
- Si quieres más control de runtime, logs de app y despliegue tipo servidor: usa Azure App Service.

---

## Opción A (Recomendada): Azure Static Web Apps

Ideal para aplicaciones frontend como InfraGen (`vite build` genera archivos estáticos).

### Recursos a crear para App Service

- Grupo de recursos (nuevo o existente).
- Azure Static Web App.
- Repositorio conectado (GitHub/Azure DevOps) para CI/CD automático.

### Qué necesitas en tu proyecto

- Script de build: `npm run build`.
- Carpeta de salida: `dist`.

### Pasos en Portal Azure

1. Crear recurso Static Web App.
2. Elegir suscripción, grupo de recursos, nombre y región.
3. En Deployment details:
   - Source: GitHub
   - Organization/Repository/Branch: tu repo y rama
   - Build preset: Vue.js
   - App location: `/`
   - API location: (vacío)
   - Output location: `dist`
4. Crear el recurso.
5. Azure crea automáticamente workflow de GitHub Actions para build y deploy.

### Comandos opcionales (validación local)

```bash
npm install
npm run build
```

---

## Opción B: Azure App Service (Web App)

Útil si quieres publicar como Web App tradicional.

### Recursos que debes crear en Azure

- Grupo de recursos.
- App Service Plan (Linux recomendado para Node).
- Web App (runtime Node LTS).

### Flujo recomendado para esta app

- Construir frontend (`npm run build`).
- Servir `dist` con un servidor estático (por ejemplo `serve`) en App Service.

### Comandos Azure CLI (ejemplo)

```bash
az login
az account set --subscription "<SUBSCRIPTION_ID>"

az group create --name "<RG_NAME>" --location "eastus"

az appservice plan create \
  --name "<PLAN_NAME>" \
  --resource-group "<RG_NAME>" \
  --sku B1 \
  --is-linux

az webapp create \
  --name "<WEBAPP_NAME_UNICO>" \
  --resource-group "<RG_NAME>" \
  --plan "<PLAN_NAME>" \
  --runtime "NODE|20-lts"
```

### Variables de aplicación sugeridas

```bash
az webapp config appsettings set \
  --resource-group "<RG_NAME>" \
  --name "<WEBAPP_NAME_UNICO>" \
  --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

> Nota: para App Service normalmente conviene agregar pipeline (GitHub Actions) que haga `npm ci && npm run build` y publique artefactos.

---

## Opción C: Storage Account Static Website (económica)

Muy buena para hosting estático simple.

### Recursos que debes crear

- Grupo de recursos.
- Storage Account (General Purpose v2).
- Habilitar Static Website.

### Pasos generales

1. Construir con `npm run build`.
2. Subir contenido de `dist` al contenedor `$web`.
3. Configurar documento índice (`index.html`) y error (`index.html` para SPA routing).

---

## ¿Y el archivo Bicep que genera InfraGen?

Sí, se puede desplegar por API/CLI de Azure:

- Con Azure CLI (directo):

```bash
az deployment group create \
  --resource-group "<RG_NAME>" \
  --template-file "./infra.bicep"
```

- Con Azure REST API:
  1. Compilar Bicep a ARM JSON.
  2. Llamar endpoint `Microsoft.Resources/deployments`.

```bash
az bicep build --file ./infra.bicep --outfile ./infra.json
```

---

## Qué opción te conviene para InfraGen

- Producción frontend rápida y simple: Static Web Apps.
- Entorno empresarial con más control operativo: App Service.
- Costo mínimo para sitio estático: Storage Static Website.

---

## Checklist mínimo antes de desplegar

- `npm run build` ejecuta sin errores.
- Confirmar que `dist` se genera correctamente.
- Definir suscripción, región y grupo de recursos.
- Confirmar estrategia de CI/CD (manual o GitHub Actions).
- Validar CORS/seguridad si luego agregas backend o API.
