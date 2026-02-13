---
name: copilot-instructions
description: Este archivo contiene instrucciones para GitHub Copilot sobre cómo generar código en este repositorio.
applyTo: **
---

# Reglas

1. Siempre da las respuestas en español.
2. Cuando generes codigo, asegúrate de seguir las mejores prácticas de programación y el estilo de código utilizado en este repositorio.
3. Siempre incluye comentarios claros y concisos en el código generado para explicar su propósito y funcionamiento.
4. Si el código generado es parte de una función o clase, asegúrate de que tenga una firma clara y que los nombres de las variables y funciones sean descriptivos.

## Arquitectura del Proyecto

```text
InfraGen/
├── src/
│   ├── components/
│   │   ├── AzureSelector.vue          # Componente principal con validaciones
│   │   ├── CostEstimator.vue          # Estimador de costos avanzado 
│   │   ├── ContainerAppConfig.vue     # Config Container Apps 
│   │   ├── StorageAccountConfig.vue   # Config Storage Account 
│   │   ├── AppServiceConfig.vue       # Config App Service 
│   │   ├── SqlDatabaseConfig.vue      # Config SQL Database 
│   │   ├── FunctionAppConfig.vue      # Config Function App 
│   │   ├── CognitiveServiceConfig.vue # Config Cognitive Services 
│   │   ├── SQLServerConfig.vue        # Config SQL Server 
│   │   └── MonitoringAlertsConfig.vue # Config Application Insights 
│   ├── utils/
│   │   └── azurePricing.js            # Sistema de precios Azure por región 
│   ├── data/
│   │   ├── environments.json          # Entornos disponibles
│   │   └── locations.json             # 35+ regiones Azure con short names
│   ├── App.vue                        # Componente raíz
│   └── main.js                        # Configuración Vuetify
├── package.json                       # Dependencias y scripts (v1.1.0)
└── README.md                          # Documentación completa
```

## Tecnologías Utilizadas

- **Vue.js 3**: Framework reactivo con Composition API y Options API
- **Vuetify 3**: Biblioteca de componentes Material Design
- **Vite**: Herramienta de build rápida y hot reload
- **JavaScript ES6+**: Sintaxis moderna, módulos y async/await
- **Azure Bicep**: Lenguaje de infraestructura como código
- **Azure Pricing API**: Cálculos de costos basados en datos reales de Azure



### 📋 Convenciones por Recurso

| Recurso | Prefijo/Formato | Ejemplo | Formato Completo |
|---------|---------|---------|------------------|
| **Resource Group** | `rg` | `rgeusmyappdev` / `rgeusmyapp` (prod) | `rg{shortLocation}{appName}{environment}` (prod sin env) |
| **Storage Account** | `sta` | `stamyappdev` / `stamyapp` (prod) | `sta{appName}{environment}` (prod sin env) |
| **App Service** | - | `myapp-dev` / `myapp` (prod) | `{appName}-{environment}` (prod sin env) |
| **App Service Plan** | `-asp` | `myapp-dev-asp` / `myapp-asp` (prod) | `{appName}-{environment}-asp` (prod sin env) |
| **Container App** | `-ca` | `myapp-webapp-dev-ca` / `myapp-webapp-ca` (prod) | `{appName}-{basename}-{environment}-ca` (prod sin env) |
| **Container Environment** | `-cae` | `myapp-dev-cae` / `myapp-cae` (prod) | `{appName}-{environment}-cae` (prod sin env) |
| **SQL Server** | `sqls` | `sqls-myapp-dev` / `sqls-myapp` (prod) | `sqls-{appName}-{environment}` (prod sin env) |
| **SQL Database** | `db-` | `db-myapp-dev` / `db-myapp` (prod) | `db-{appName}-{environment}` (prod sin env) |
| **Application Insights** | `-ain` | `myapp-webapp-dev-ain` / `myapp-webapp-ain` (prod) | `{appName}-{basename}-{environment}-ain` (prod sin env) |
| **Function App** | `func` | `funceusmyappdev` | `func{shortLocation}{appName}{environment}` |
| **Cognitive Service** | `cog` | `cogeusmyappdev` | `cog{shortLocation}{appName}{environment}` |
| **Log Analytics** | `log` | `logeusmyappdev` | `log{shortLocation}{appName}{environment}` |

### Reglas de Nomenclatura

1. **Locations**: Se usan short names de 3 caracteres (solo para algunos recursos)
  - `East US` → `eus`
  - `West Europe` → `weu`
  - `Southeast Asia` → `sea`
  - `Mexico Central` → `mxc`

2. **App Names**: Se limpian automáticamente
  - Solo letras y números (sin espacios ni caracteres especiales)
  - Se convierte a minúsculas
  - Ejemplo: `"My Web App"` → `mywebapp`

3. **Environments**: Se usan nombres cortos
  - `Development` → `dev`
  - `Testing` → `test`
  - `Staging` → `stage`
  - `Production` → `prod`

4. **Casos Especiales**:
  - **Storage Account**: Solo incluye appName + environment (sin location, sin guiones, prod sin env)
  - **App Service**: Formato simple con guión: `{appName}-{environment}` (sin environment en prod)
  - **App Service Plan**: Formato con guiones: `{appName}-{environment}-asp` (sin environment en prod)
  - **SQL Server**: Formato con guiones: `sqls-{appName}-{environment}` (sin environment en prod)
  - **Resource Group/Storage Account/App Service/App Service Plan/SQL Server/Database (Production)**: Sin environment para recursos de producción
  - **Resource Group**: Mantiene formato completo con location, excepto en producción

5. **Validaciones Azure**:
  - **Storage Account**: Solo letras minúsculas y números (limitación Azure)
  - **Resource Group**: Creación automática si no existe (targetScope = 'subscription')
  - **SQL Database**: Incluye referencia automática al SQL Server

### Ejemplo Completo

Para una aplicación llamada `"MyWebApp"` en ubicación `"East US"` y environment `"Development"`:

```text
Resource Group:     rgeusmywebappdev
Storage Account:    stamywebappdev
App Service Plan:   mywebapp-dev-asp
App Service:        mywebapp-dev
Container App:      mywebapp-webapp-dev-ca
Container Environment: mywebapp-dev-cae
SQL Server:         sqls-mywebapp-dev
SQL Database:       db-mywebapp-dev
Application Insights: mywebapp-webapp-dev-ain
Function App:       funceusmywebappdev
```

**Caso especial para Production:**
```text
Resource Group:     rgeusmywebapp (sin environment)
Storage Account:    stamywebapp (sin environment)
App Service Plan:   mywebapp-asp (sin environment)
App Service:        mywebapp (sin environment)
Container App:      mywebapp-webapp-ca (sin environment)
Container Environment: mywebapp-cae (sin environment)
SQL Server:         sqls-mywebapp (sin environment)
SQL Database:       db-mywebapp (sin environment)
Application Insights: mywebapp-webapp-ain (sin environment)
```

# Skills Requeridos

- Para generar código de bicep utiliza el skill `bicep-generator`: `.github/skills/bicep-generator/SKILL.md`.


# Referencias

- Definiciones de agentes: [agents/AGENTS.md](agents/AGENTS.md)
- Vue.js Style Guide: [https://vuejs.org/v2/style-guide/](https://vuejs.org/v2/style-guide/)
- Azure Bicep Best Practices: [https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/best-practices)  
