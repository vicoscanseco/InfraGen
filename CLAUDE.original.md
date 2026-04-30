# InfraGen — Guía para Claude Code

## Reglas generales

1. Siempre responde en español.
2. Sigue las mejores prácticas y el estilo de código del repositorio.
3. Incluye comentarios claros y concisos en el código generado.
4. Usa nombres de variables y funciones descriptivos.

## Comandos de desarrollo

```bash
npm run dev        # Servidor de desarrollo con hot reload
npm run build      # Build de producción
npm run preview    # Preview del build
npm run test       # Ejecutar tests con Vitest
```

## Arquitectura del proyecto

```text
InfraGen/
├── src/
│   ├── components/
│   │   ├── AzureSelector.vue          # Componente principal con validaciones
│   │   ├── CostEstimator.vue          # Estimador de costos avanzado
│   │   ├── ArchitectureView.vue       # Diagrama interactivo (vue-flow)
│   │   ├── AzureDeploymentManager.vue # Helper CLI de despliegue
│   │   ├── InfraWizard.vue            # Flujo guiado paso a paso
│   │   ├── ContainerAppConfig.vue     # Config Container Apps
│   │   ├── StorageAccountConfig.vue   # Config Storage Account
│   │   ├── AppServiceConfig.vue       # Config App Service
│   │   ├── AppServicePlanConfig.vue   # Config App Service Plan
│   │   ├── SqlDatabaseConfig.vue      # Config SQL Database
│   │   ├── SQLServerConfig.vue        # Config SQL Server
│   │   ├── FunctionAppConfig.vue      # Config Function App
│   │   ├── CognitiveServiceConfig.vue # Config Cognitive Services
│   │   └── MonitoringAlertsConfig.vue # Config Application Insights
│   ├── utils/
│   │   ├── bicepGenerator.js          # Generación de código Bicep
│   │   ├── azurePricing.js            # Precios Azure por región
│   │   ├── bicepImportParser.js       # Parser de Bicep existente
│   │   ├── configPersistence.js       # Auto-save en localStorage
│   │   └── ruleValidators.js          # Validaciones y naming conventions
│   ├── data/
│   │   ├── environments.json          # Entornos disponibles
│   │   └── locations.json             # 35+ regiones Azure con short names
│   ├── App.vue                        # Componente raíz
│   └── main.js                        # Configuración Vuetify
├── tests/                             # Tests con Vitest
├── .agents/skills/                    # Skills para agentes Claude
└── .github/skills/                    # Skills para GitHub Copilot
```

## Tecnologías

- **Vue 3.5**: Composition API (`<script setup>`)
- **Vuetify 3.9**: Componentes Material Design
- **vue-flow 1.46**: Diagramas de arquitectura interactivos
- **Vite 7**: Build tool con lazy-loading de configuradores
- **Vitest 4**: Tests unitarios
- **Azure Bicep**: Infraestructura como código generada

## Convenciones de naming Azure

| Recurso | Formato | Ejemplo (dev) | Ejemplo (prod) |
|---------|---------|---------------|----------------|
| Resource Group | `rg{loc}{app}{env}` | `rgeusmyappdev` | `rgeusmyapp` |
| Storage Account | `sta{app}{env}` | `stamyappdev` | `stamyapp` |
| App Service | `{app}-{env}` | `myapp-dev` | `myapp` |
| App Service Plan | `{app}-{env}-asp` | `myapp-dev-asp` | `myapp-asp` |
| Container App | `{app}-{base}-{env}-ca` | `myapp-web-dev-ca` | `myapp-web-ca` |
| Container Environment | `{app}-{env}-cae` | `myapp-dev-cae` | `myapp-cae` |
| SQL Server | `sqls-{app}-{env}` | `sqls-myapp-dev` | `sqls-myapp` |
| SQL Database | `db-{app}-{env}` | `db-myapp-dev` | `db-myapp` |
| Application Insights | `{app}-{base}-{env}-ain` | `myapp-web-dev-ain` | `myapp-web-ain` |
| Function App | `func{loc}{app}{env}` | `funceusmyappdev` | `funceusmyappdev` |
| Cognitive Service | `cog{loc}{app}{env}` | `cogeusmyappdev` | `cogeusmyappdev` |
| Log Analytics | `log{loc}{app}{env}` | `logeusmyappdev` | `logeusmyappdev` |

**Reglas clave:**
- **Producción**: sin sufijo de environment en la mayoría de recursos
- **App Names**: solo letras y números en minúsculas (`"My App"` → `myapp`)
- **Locations (short)**: `East US` → `eus`, `West Europe` → `weu`, `Southeast Asia` → `sea`, `Mexico Central` → `mxc`
- **Environments (short)**: `Development` → `dev`, `Testing` → `test`, `Calidad` → `qa`, `Production` → `prod`
- **Storage Account**: sin guiones, sin location (limitación Azure)

## Skills disponibles

- **Bicep**: `.github/skills/bicep-generator/SKILL.md`
- **Vue.js**: `.github/skills/vue-best-practices/SKILL.md`
- **Git flow**: `.agents/skills/git-flow/SKILL.md`

## Referencias

- Definiciones de agentes: [agents/AGENTS.md](agents/AGENTS.md)
- Roadmap: [nextFeatures.md](nextFeatures.md)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
