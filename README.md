# InfraGen - Generador de Infraestructura Azure

## 📋 Tabla de Contenidos

- [InfraGen - Generador de Infraestructura Azure](#infragen---generador-de-infraestructura-azure)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [📝 Descripción](#-descripción)
  - [🚀 Características](#-características)
  - [💰 Estimador de Costos](#-estimador-de-costos)
    - [🌍 Precios por Región](#-precios-por-región)
    - [📊 Análisis de Costos](#-análisis-de-costos)
    - [📁 Descarga de Reportes](#-descarga-de-reportes)
  - [🔒 Sistema de Validaciones](#-sistema-de-validaciones)
    - [✅ Validaciones Principales](#-validaciones-principales)
    - [🎯 Estados de los Botones](#-estados-de-los-botones)
  - [📏 Convenciones de Nomenclatura](#-convenciones-de-nomenclatura)
    - [🏷️ Formato General](#️-formato-general)
    - [📋 Convenciones por Recurso](#-convenciones-por-recurso)
    - [🔤 Reglas de Nomenclatura](#-reglas-de-nomenclatura)
    - [📐 Ejemplo Completo](#-ejemplo-completo)
  - [📋 Recursos Soportados](#-recursos-soportados)
    - [🗄️ Storage Account](#️-storage-account)
    - [🌐 App Service \& App Service Plan](#-app-service--app-service-plan)
    - [🗃️ SQL Server \& SQL Database](#️-sql-server--sql-database)
    - [⚡ Function App](#-function-app)
    - [🧠 Cognitive Services](#-cognitive-services)
    - [📊 Monitoring \& Alerts](#-monitoring--alerts)
  - [🏗️ Arquitectura del Proyecto](#️-arquitectura-del-proyecto)
  - [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
  - [📦 Instalación y Uso](#-instalación-y-uso)
    - [Prerrequisitos](#prerrequisitos)
    - [Instalación](#instalación)
    - [Uso de la Aplicación](#uso-de-la-aplicación)
  - [🎯 Flujo de Trabajo con Validaciones](#-flujo-de-trabajo-con-validaciones)
  - [🔧 Configuración Avanzada](#-configuración-avanzada)
    - [Ambientes Personalizados](#ambientes-personalizados)
    - [Regiones Adicionales](#regiones-adicionales)
    - [Personalizar Validaciones](#personalizar-validaciones)
  - [📊 Estadísticas del Proyecto](#-estadísticas-del-proyecto)
  - [🚀 Características Técnicas Avanzadas](#-características-técnicas-avanzadas)
    - [Sistema de Validaciones](#sistema-de-validaciones)
    - [Estimador de Costos](#estimador-de-costos)
    - [Generación de Código Bicep](#generación-de-código-bicep)
    - [Interfaz de Usuario](#interfaz-de-usuario)
  - [🤝 Contribuir](#-contribuir)
    - [Estructura para Nuevos Componentes](#estructura-para-nuevos-componentes)
  - [📝 Licencia](#-licencia)
  - [👨‍💻 Autor](#-autor)

## 📝 Descripción 
InfraGen es una aplicación web avanzada diseñada para facilitar la creación, configuración y estimación de costos de infraestructuras en Microsoft Azure de manera visual, rápida y sin necesidad de escribir código manualmente. Su objetivo principal es permitir a desarrolladores, arquitectos y equipos de TI seleccionar, personalizar y validar recursos Azure siguiendo las mejores prácticas, generando automáticamente código Bicep listo para despliegue.

La plataforma integra un sistema inteligente de validaciones y dependencias, asegurando configuraciones correctas y nomenclatura consistente para todos los recursos. Además, InfraGen ofrece un estimador de costos en tiempo real basado en precios oficiales de Azure, con análisis detallado por región y recomendaciones de optimización.

Entre sus principales funcionalidades destacan:
- Interfaz intuitiva basada en Vuetify 3 y Material Design.
- Selección visual de recursos Azure (Storage, App Service, SQL, Functions, Cognitive Services, Monitoring, etc.).
- Generación automática de código Bicep modular y optimizado.
- Sistema de nomenclatura automática y validaciones reactivas.
- Estimación de costos mensual con desglose por categorías y regiones.
- Exportación de reportes en múltiples formatos (CSV, Excel, JSON, impresión).
- Arquitectura modular y escalable, ideal para equipos y proyectos de cualquier tamaño.

InfraGen está pensado para acelerar la adopción de infraestructura como código en Azure, reducir errores de configuración y mejorar la transparencia en la estimación de costos y dependencias técnicas.

Aplicación web moderna construida con Vue.js 3 y Vuetify 3 que permite seleccionar y configurar recursos de Azure para generar código Bicep de manera visual e intuitiva, incluyendo **estimación de costos en tiempo real** y **análisis por región**.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![Vuetify](https://img.shields.io/badge/Vuetify-3.x-1867C0?style=flat-square&logo=vuetify)
![Azure](https://img.shields.io/badge/Azure-Bicep-0078D4?style=flat-square&logo=microsoft-azure)
![Version](https://img.shields.io/badge/Version-1.1.0-brightgreen?style=flat-square)

## 🚀 Características

- **Interfaz moderna**: UI intuitiva con Vuetify 3 y Material Design
- **Configuración visual**: Selección y configuración de recursos Azure sin código
- **Generación automática**: Código Bicep profesional con mejores prácticas
- **💰 Estimador de costos**: Cálculo automático de costos mensuales en tiempo real
- **🌍 Precios por región**: Ajustes automáticos según la región Azure seleccionada
- **📊 Análisis de costos**: Desglose por categorías y recomendaciones de optimización
- **📁 Múltiples formatos**: Descarga de reportes en CSV, Excel, JSON e impresión
- **Validaciones inteligentes**: Sistema completo de validaciones con dependencias
- **Nomenclatura automática**: Convenciones consistentes para todos los recursos
- **Sistema modular**: Componentes especializados para cada tipo de recurso
- **Vista previa de código**: Visualización con tema oscuro tipo VS Code
- **Feedback visual**: Tooltips, alertas y estados de botones interactivos

## 💰 Estimador de Costos

InfraGen incluye un **sistema avanzado de estimación de costos** que proporciona información detallada sobre los gastos mensuales estimados de tu infraestructura Azure.

### 🌍 Precios por Región

El sistema ajusta automáticamente los precios según la región Azure seleccionada:

| Región | Multiplicador | Ejemplo (Storage Basic) |
|--------|---------------|-------------------------|
| **East US** | 1.00x (base) | $2.40/mes |
| **Mexico Central** | 1.15x (+15%) | $2.76/mes |
| **West Europe** | 1.08x (+8%) | $2.59/mes |
| **Japan East** | 1.20x (+20%) | $2.88/mes |
| **Brazil South** | 1.25x (+25%) | $3.00/mes |

- **35+ regiones** con multiplicadores precisos
- **Actualización automática** al cambiar región
- **Transparencia total** en los cálculos

### 📊 Análisis de Costos

El estimador proporciona análisis detallado con:

**Desglose por Categorías:**

- 🖥️ **Cómputo** (App Service, Function App)
- 🗄️ **Base de Datos** (SQL Database)
- 💾 **Almacenamiento** (Storage Account)
- 🧠 **Inteligencia Artificial** (Cognitive Services)
- 📊 **Monitoreo** (Application Insights)

**Recomendaciones Inteligentes:**

- ✅ Sugerencias de optimización de costos
- ⚠️ Alertas sobre recursos premium
- 💡 Alternativas más económicas
- 📈 Análisis de configuración (económica/intermedia/enterprise)

```text
┌─────────────────────────────────────────────────────────────┐
│                 💰 Estimación de Costos Mensual            │
├─────────────────────────────────────────────────────────────┤
│ Storage Account (Standard_LRS)          $2.76             │
│ App Service Plan (B1)                   $15.11            │
│ SQL Database (Basic)                    $5.75             │
│ Application Insights                    $2.65             │
├─────────────────────────────────────────────────────────────┤
│ Total: $26.27/mes                                          │
│ 📍 Mexico Central (+15% vs East US)                        │
└─────────────────────────────────────────────────────────────┘
```

### 📁 Descarga de Reportes

Exporta la estimación de costos en múltiples formatos:

**Formatos Disponibles:**

- 📋 **CSV** - Compatible con Excel y hojas de cálculo
- 📈 **Excel (.xls)** - Archivo nativo con formato y estilos
- 💾 **JSON** - Datos estructurados para APIs/desarrollo
- 🖨️ **Imprimir** - Reporte HTML optimizado para impresión

**Contenido del Reporte:**

- Metadatos completos (fecha, región, multiplicador)
- Lista detallada de componentes con costos
- Desglose por categorías con porcentajes
- Recomendaciones de optimización
- Información de región y ajustes aplicados

## 🔒 Sistema de Validaciones

InfraGen incluye un sistema robusto de validaciones que asegura configuraciones válidas y dependencias correctas:

### ✅ Validaciones Principales

1. **Información Básica Requerida**
   - Nombre de aplicación obligatorio
   - Nombre de grupo de recursos obligatorio
   - Selección de ubicación requerida
   - **Visual**: Alerta informativa y botones deshabilitados

2. **Dependencias de Componentes**
   - **App Service** → Requiere **App Service Plan**
   - **SQL Database** → Requiere **SQL Server**
   - **Visual**: Tooltips explicativos e iconos de estado

3. **Feedback Visual Inteligente**
   - 🔒 Ícono de candado para componentes no disponibles
   - ✅ Ícono de check para componentes disponibles
   - 📝 Tooltips explicativos al hacer hover
   - ⚠️ Alertas informativas contextuales
   - 🎨 Atenuación visual (opacity) para elementos deshabilitados

### 🎯 Estados de los Botones

```text
┌─────────────────────────────────────────────────────────────┐
│                    Estado de Componentes                    │
├─────────────────────────────────────────────────────────────┤
│ ✅ Storage Account         │ Disponible - Info básica OK    │
│ 🔒 App Service            │ Requiere App Service Plan      │
│ ✅ App Service Plan       │ Disponible - Info básica OK    │
│ 🔒 SQL Database           │ Requiere SQL Server            │
│ ✅ SQL Server             │ Disponible - Info básica OK    │
│ ✅ Function App           │ Disponible - Info básica OK    │
│ ✅ Cognitive Service      │ Disponible - Info básica OK    │
│ ✅ Monitoring Alerts      │ Disponible - Info básica OK    │
└─────────────────────────────────────────────────────────────┘
```

## 📏 Convenciones de Nomenclatura

InfraGen sigue convenciones estrictas y consistentes para garantizar nombres únicos y descriptivos:

### 🏷️ Formato General

```text
{prefijo}{shortLocation}{appName}
```

### 📋 Convenciones por Recurso

| Recurso | Prefijo | Ejemplo | Formato Completo |
|---------|---------|---------|------------------|
| **Resource Group** | `rg` | `rgeusmyapp` | `rg{shortLocation}{appName}` |
| **Storage Account** | `st` | `steusmyapp` | `st{shortLocation}{appName}` (sin guiones) |
| **App Service** | `app` | `appeusmyapp` | `app{shortLocation}{appName}` |
| **App Service Plan** | `asp` | `aspeusmyapp` | `asp{shortLocation}{appName}` |
| **SQL Server** | `sql` | `sqleusmyapp` | `sql{shortLocation}{appName}` |
| **SQL Database** | `sqldb` | `sqldbeusmyapp` | `sqldb{shortLocation}{appName}` |
| **Function App** | `func` | `funceusmyapp` | `func{shortLocation}{appName}` |
| **Cognitive Service** | `cog` | `cogeusmyapp` | `cog{shortLocation}{appName}` |
| **Log Analytics** | `log` | `logeusmyapp` | `log{shortLocation}{appName}` |

### 🔤 Reglas de Nomenclatura

1. **Locations**: Se usan short names de 3 caracteres
   - `East US` → `eus`
   - `West Europe` → `weu`
   - `Southeast Asia` → `sea`
   - `Mexico Central` → `mxc`

2. **App Names**: Se limpian automáticamente
   - Solo letras y números (sin espacios ni caracteres especiales)
   - Se convierte a minúsculas
   - Ejemplo: `"My Web App"` → `mywebapp`

3. **Casos Especiales**:
   - **Storage Account**: Solo letras minúsculas y números (limitación Azure)
   - **Resource Group**: Creación automática si no existe (targetScope = 'subscription')
   - **SQL Database**: Incluye referencia automática al SQL Server

### 📐 Ejemplo Completo

Para una aplicación llamada `"MyWebApp"` en ubicación `"East US"`:

```text
Resource Group:     rgeusmywebapp
Storage Account:    steusmywebapp
App Service Plan:   aspeusmywebapp
App Service:        appeusmywebapp
SQL Server:         sqleusmywebapp
SQL Database:       sqldbeusmywebapp
Function App:       funceusmywebapp
```

## 📋 Recursos Soportados

### 🗄️ Storage Account

Configuración completa de cuentas de almacenamiento con opciones de SKU, tipo de acceso y políticas de seguridad.

**Características:**

- Múltiples SKUs (Standard_LRS, Standard_GRS, Premium_LRS)
- Tipos de almacenamiento (StorageV2, BlobStorage, BlockBlobStorage)
- Configuración de niveles de acceso (Hot, Cool, Archive)
- Habilitación de HTTPS forzado
- Control de acceso público

**Valores por Defecto:**

- SKU: `Standard_LRS`
- Tipo: `StorageV2`
- Nivel: `Cool`
- HTTPS Only: `Habilitado`

```text
┌─────────────────────────────────────┐
│ Storage Account Configuration       │
├─────────────────────────────────────┤
│ Name: stprodeastusMyapp            │
│ SKU: Standard_LRS ▼                │
│ Kind: StorageV2 ▼                  │
│ Access Tier: Cool ▼                │
│ ☑ Enable HTTPS Traffic Only        │
│ ☐ Allow Public Access             │
└─────────────────────────────────────┘
```

### 🌐 App Service & App Service Plan

Configuración detallada de App Services con planes de servicio y configuraciones de runtime.

**App Service Plan - Características:**

- 11+ opciones de SKU (F1, D1, B1, B2, B3, S1-S3, P1V2-P3V2, P1V3-P3V3)
- Configuración de OS (Windows/Linux)
- Instancias configurables

**App Service - Características:**

- Múltiples runtime stacks (Node.js, .NET, Python, Java, PHP)
- Configuración de versiones específicas
- Always On habilitado
- HTTPS Only forzado

**Valores por Defecto:**

- SKU: `B1` (Basic)
- Runtime: `.NET 8`
- OS: `Linux`
- Always On: `Habilitado`

```text
┌─────────────────────────────────────┐
│ App Service Plan Configuration      │
├─────────────────────────────────────┤
│ Name: aspprod_eastus_MyWebApp      │
│ SKU: B1 ▼                          │
│ OS: Linux ▼                        │
│ Instances: 1                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ App Service Configuration           │
├─────────────────────────────────────┤
│ Name: appprod_eastus_MyWebApp      │
│ Runtime: .NET 8 ▼                  │
│ ☑ Always On                       │
│ ☑ HTTPS Only                      │
└─────────────────────────────────────┘
```

### 🗃️ SQL Server & SQL Database

Sistema completo de base de datos SQL con servidor, configuraciones de seguridad y firewall.

**SQL Server - Características:**

- Configuración de administrador y contraseña
- Firewall rules automáticas
- Versión SQL 12.0 (SQL Server 2014)

**SQL Database - Características:**

- 6 ediciones disponibles (Basic, Standard, Premium, GeneralPurpose, BusinessCritical, Hyperscale)
- 50+ collations disponibles
- Configuración DTU/vCore
- Threat Detection habilitado
- Validación robusta de contraseñas

**Valores por Defecto:**

- Edición: `Basic`
- Collation: `SQL_Latin1_General_CP1_CI_AS`
- Admin User: `sqladmin`
- Firewall: `Permitir servicios Azure`

```text
┌─────────────────────────────────────┐
│ SQL Server Configuration            │
├─────────────────────────────────────┤
│ Name: sqlprod_eastus_MyWebApp      │
│ Admin User: sqladmin               │
│ Password: ************             │
│ Version: 12.0                      │
│ ☑ Allow Azure Services Access      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ SQL Database Configuration          │
├─────────────────────────────────────┤
│ Name: sqldbprod_eastus_MyWebApp    │
│ Server: sqlprod_eastus_MyWebApp    │
│ Edition: Basic ▼                   │
│ Collation: SQL_Latin1_General... ▼ │
│ ☑ Enable Threat Detection          │
│ ☑ Enable Firewall Rules           │
└─────────────────────────────────────┘
```

### ⚡ Function App

Configuración avanzada de Azure Functions con diferentes planes de hosting.

**Características:**

- 3 tipos de planes (Consumption, Premium, Dedicated)
- SKUs dinámicos según el plan seleccionado
- Runtime stacks especializados (.NET, Node.js, Python, Java, PowerShell)
- Application Insights integrado
- Storage Account automático
- Configuración HTTPS forzado

**Valores por Defecto:**

- Plan: `Consumption`
- Runtime: `.NET 8`
- OS: `Windows`
- Application Insights: `Habilitado`

```text
┌─────────────────────────────────────┐
│ Function App Configuration          │
├─────────────────────────────────────┤
│ Name: funcprod_eastus_MyWebApp     │
│ Hosting: Consumption Plan ▼        │
│ Runtime: .NET 8 ▼                  │
│ OS: Windows ▼                      │
│ ☑ Application Insights             │
│ ☑ HTTPS Only                      │
└─────────────────────────────────────┘
```

### 🧠 Cognitive Services

Configuración de servicios de IA y Machine Learning de Azure.

**Características:**

- 15+ tipos de servicios (Computer Vision, Speech, Language, etc.)
- 3 niveles de SKU (F0 Free, S0 Standard, S1 Premium)
- Configuración de acceso público

**Valores por Defecto:**

- Tipo: `CognitiveServices` (Multi-Service)
- SKU: `S0` (Standard)
- Acceso Público: `Habilitado`

```text
┌─────────────────────────────────────┐
│ Cognitive Service Configuration     │
├─────────────────────────────────────┤
│ Name: cogprod_eastus_MyWebApp      │
│ Kind: CognitiveServices ▼          │
│ SKU: S0 ▼                          │
│ ☑ Allow Public Network Access      │
└─────────────────────────────────────┘
```

### 📊 Monitoring & Alerts

Sistema de monitoreo con Log Analytics y alertas configurables.

**Características:**

- Workspace de Log Analytics
- 3 tipos de alertas (CPU, Memory, Response Time)
- Configuración de umbrales personalizables
- Integración automática con recursos

**Valores por Defecto:**

- SKU: `PerGB2018`
- Retención: `30 días`
- Alertas: `CPU > 80%, Memory > 85%, Response > 5s`

```text
┌─────────────────────────────────────┐
│ Monitoring Configuration            │
├─────────────────────────────────────┤
│ Workspace: logprod_eastus_MyWebApp │
│ SKU: PerGB2018 ▼                   │
│ Retention: 30 days                 │
│ ☑ Enable CPU Alerts               │
│ ☑ Enable Memory Alerts            │
│ ☑ Enable Response Time Alerts     │
└─────────────────────────────────────┘
```

## 🏗️ Arquitectura del Proyecto

```text
InfraGen/
├── src/
│   ├── components/
│   │   ├── AzureSelector.vue          # Componente principal con validaciones (767+ líneas)
│   │   ├── CostEstimator.vue          # Estimador de costos avanzado (550+ líneas)
│   │   ├── StorageAccountConfig.vue   # Config Storage Account (160+ líneas)
│   │   ├── AppServiceConfig.vue       # Config App Service (180+ líneas)
│   │   ├── SqlDatabaseConfig.vue      # Config SQL Database (460+ líneas)
│   │   ├── FunctionAppConfig.vue      # Config Function App (270+ líneas)
│   │   ├── CognitiveServiceConfig.vue # Config Cognitive Services (140+ líneas)
│   │   ├── SQLServerConfig.vue        # Config SQL Server (130+ líneas)
│   │   └── MonitoringAlertsConfig.vue # Config Monitoring (120+ líneas)
│   ├── utils/
│   │   └── azurePricing.js            # Sistema de precios Azure por región (330+ líneas)
│   ├── data/
│   │   ├── environments.json          # Entornos disponibles
│   │   └── locations.json             # 35+ regiones Azure con short names
│   ├── App.vue                        # Componente raíz
│   └── main.js                        # Configuración Vuetify
├── package.json                       # Dependencias y scripts (v1.1.0)
└── README.md                          # Documentación completa
```

## 🛠️ Tecnologías Utilizadas

- **Vue.js 3**: Framework reactivo con Composition API y Options API
- **Vuetify 3**: Biblioteca de componentes Material Design
- **Vite**: Herramienta de build rápida y hot reload
- **JavaScript ES6+**: Sintaxis moderna, módulos y async/await
- **Azure Bicep**: Lenguaje de infraestructura como código
- **Azure Pricing API**: Cálculos de costos basados en datos reales de Azure

## 📦 Instalación y Uso

### Prerrequisitos

- Node.js 16+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/vicoscanseco/InfraGen.git
cd InfraGen

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Uso de la Aplicación

1. **Información Básica** (Obligatorio):
   - Nombre de aplicación
   - Seleccionar ambiente (Development, Testing, Staging, Production)
   - Elegir ubicación Azure

2. **Configurar Resource Group** (Obligatorio):
   - Se genera automáticamente: `rg{environment}_{location}_{appName}`
   - Creación automática si no existe (targetScope = 'subscription')

3. **Agregar Componentes** (Con Validaciones):
   - ✅ Componentes disponibles después de información básica
   - 🔒 App Service requiere App Service Plan
   - 🔒 SQL Database requiere SQL Server

4. **Configurar Recursos**:
   - Valores por defecto inteligentes
   - Configuración específica por componente
   - Validaciones en tiempo real

5. **Generar Bicep**:
   - Código optimizado con mejores prácticas
   - Nomenclatura consistente
   - Vista previa con sintaxis highlighting

## 🎯 Flujo de Trabajo con Validaciones

```text
[Información Básica] → [Resource Group] → [Validaciones de Dependencias]
            ↓
[Agregar Componentes] → [Configurar] → [Generar Bicep] → [Copiar Código]
            ↓
    [Visual Feedback: Tooltips, Alertas, Estados]
```

## 🔧 Configuración Avanzada

### Ambientes Personalizados

Edita `src/data/environments.json` para agregar nuevos entornos:

```json
["Development", "Testing", "Staging", "Production", "CustomEnv"]
```

### Regiones Adicionales

Modifica `src/data/locations.json` para incluir nuevas regiones Azure:

```json
[
  "East US", "West US", "West Europe", "Southeast Asia",
  "Brazil South", "Australia East", "Japan East"
]
```

### Personalizar Validaciones

En `AzureSelector.vue`, las validaciones están definidas en computed properties:

```javascript
// Validación información básica
isBasicInfoComplete() {
  return this.appName && this.resourceGroupName && this.location
}

// Validación dependencias
hasAppServicePlan() {
  return this.components.some(c => c.type === 'AppServicePlan')
}

hasSQLServer() {
  return this.components.some(c => c.type === 'SQLServer')
}
```

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~3,200+ líneas (incluye estimador de costos)
- **Componentes Vue**: 9 componentes especializados
- **Recursos Azure**: 8 tipos completamente configurables
- **Validaciones**: 20+ patrones de validación
- **Configuraciones**: 80+ opciones únicas
- **Nomenclatura**: Convenciones automáticas para todos los recursos
- **💰 Sistema de Costos**: 35+ regiones con multiplicadores precisos
- **📊 Análisis de Costos**: 6 categorías de recursos con recomendaciones
- **📁 Formatos de Export**: 4 formatos de descarga (CSV, Excel, JSON, Print)

## 🚀 Características Técnicas Avanzadas

### Sistema de Validaciones

- **Reactivo**: Validaciones en tiempo real con Vue.js reactivity
- **Visual**: Feedback inmediato con iconos, tooltips y estados
- **Inteligente**: Dependencias automáticas entre componentes

### Estimador de Costos

- **Tiempo Real**: Cálculos automáticos al agregar/modificar componentes
- **Regional**: Multiplicadores específicos por región Azure (35+ regiones)
- **Inteligente**: Recomendaciones automáticas de optimización
- **Exportable**: Múltiples formatos para análisis posterior

### Generación de Código Bicep

- **Optimizado**: Código limpio siguiendo mejores prácticas
- **Modular**: Recursos organizados por tipo
- **Escalable**: targetScope = 'subscription' para despliegues automáticos

### Interfaz de Usuario

- **Material Design**: Componentes Vuetify 3 consistentes
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Accesible**: Tooltips, alertas y estados claramente definidos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevoRecurso`)
3. Commit tus cambios (`git commit -m 'Add: Nuevo recurso Azure'`)
4. Push a la rama (`git push origin feature/NuevoRecurso`)
5. Abre un Pull Request

### Estructura para Nuevos Componentes

```javascript
// Ejemplo: NuevoRecursoConfig.vue
<template>
  <!-- UI con localConfig pattern -->
</template>

<script>
export default {
  props: ['modelValue'],
  data() {
    return {
      localConfig: {
        // Valores por defecto
      }
    }
  },
  watch: {
    modelValue: {
      handler(newVal) {
        if (newVal) this.localConfig = { ...newVal }
      },
      immediate: true
    }
  },
  methods: {
    updateConfig() {
      this.$emit('update:config', this.localConfig)
      this.$emit('update:model-value', this.localConfig)
      this.$emit('update', this.localConfig)
    }
  }
}
</script>
```

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Victor Canseco

- GitHub: [@vicoscanseco](https://github.com/vicoscanseco)

---

⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!

**Versión 1.1.0** - Actualizada con estimador de costos, precios por región y exportación de reportes.
