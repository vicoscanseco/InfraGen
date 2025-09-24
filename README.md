# InfraGen - Generador de Infraestructura Azure

## 📋 Tabla de Contenidos

- [InfraGen - Generador de Infraestructura Azure](#infragen---generador-de-infraestructura-azure)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [📝 Descripción](#-descripción)
  - [🚀 Características](#-características)
    - [🗺️ Vista de Arquitectura Visual](#️-vista-de-arquitectura-visual)
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
    - [📊 Monitoring \& Alerts (Application Insights)](#-monitoring--alerts-application-insights)
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
![Version](https://img.shields.io/badge/Version-2.0.0-brightgreen?style=flat-square)


## 🚀 Características

### 🗺️ Vista de Arquitectura Visual

- Visualiza la arquitectura generada de tus recursos Azure en un diagrama interactivo.
- Cada recurso se muestra como un nodo, indicando el tipo y el nombre generado (en una línea separada).
- Las dependencias lógicas (App Service → App Service Plan, SQL Database → SQL Server) se representan con conexiones automáticas.
- Implementado con vue-flow y modal responsive.

- **Interfaz moderna**: UI intuitiva con Vuetify 3 y Material Design
- **Configuración visual**: Selección y configuración de recursos Azure sin código
- **Generación automática**: Código Bicep profesional con mejores prácticas
- **💰 Estimador de costos**: Cálculo automático de costos mensuales en tiempo real
- **🌍 Precios por región**: Ajustes automáticos según la región Azure seleccionada
- **📊 Análisis de costos**: Desglose por categorías y recomendaciones de optimización
- **📁 Múltiples formatos**: Descarga de reportes en CSV, Excel, JSON e impresión
- **Validaciones inteligentes**: Sistema completo de validaciones con dependencias
- **🔗 Eliminación en cascada**: Validación automática de dependencias App Service ↔ App Service Plan y SQL Server ↔ SQL Database  
- **🔄 Asignación automática**: Los componentes dependientes se asocian automáticamente a sus recursos padre
- **📋 Mapeo de propiedades**: Traducción automática entre propiedades de UI y Azure Bicep
- **🎯 Configuración completa**: Todas las propiedades importantes configurables en la interfaz
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

4. **🔗 Eliminación en Cascada (Nuevo)**
   - **App Service Plan** → Elimina automáticamente todos los **App Services** asociados
   - **SQL Server** → Elimina automáticamente todas las **SQL Databases** asociadas
   - **Visual**: Mensajes informativos detallados con nombres específicos
   - **Inteligente**: Detecta múltiples propiedades de referencia para máxima compatibilidad

5. **🔄 Asignación Automática de Dependencias (Nuevo)**
   - **App Service** → Se asocia automáticamente al **App Service Plan** disponible
   - **SQL Database** → Se asocia automáticamente al **SQL Server** disponible
   - **Reactive**: Actualización en tiempo real cuando se agregan recursos padre

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
{prefijo}{shortLocation}{appName}{environment}
```

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

### 🔤 Reglas de Nomenclatura

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

### 📐 Ejemplo Completo

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

### 🐳 Container App

Configuración completa de Azure Container Apps con soporte para containers, scaling automático y variables de entorno.

**Características:**

- **Imagen de Container**: Soporte para Docker Hub, Azure Container Registry, y registries públicos
- **Recursos Configurables**: CPU (0.25-2.0 vCPUs) y Memoria (0.5-4.0 Gi)
- **Auto-scaling**: Réplicas mínimas (0-25) y máximas (1-25) con soporte para scale-to-zero
- **Networking**: Acceso público configurable (Ingress) con soporte HTTP/HTTPS
- **Variables de Entorno**: Interfaz dinámica para agregar/quitar variables
- **Container Apps Environment**: Se crea automáticamente para alojar las aplicaciones
- **Políticas de Reinicio**: Always, OnFailure, Never
- **Nomenclatura Automática**: Sigue la convención `{appname}-{basename}-{environment}-ca`

**Valores por Defecto:**

- Imagen: `ubuntu:latest`
- CPU: `0.25 vCPU`
- Memoria: `0.5Gi`
- Puerto: `80`
- Min Replicas: `0` (scale-to-zero habilitado)
- Max Replicas: `10`
- Ingress: `Habilitado`
- HTTPS: `Habilitado`

```text
┌─────────────────────────────────────┐
│ Container App Configuration         │
├─────────────────────────────────────┤
│ Name: myapp-webapp-dev-ca          │
│ Image: ubuntu:latest               │
│ CPU: 0.25 vCPU ▼                   │
│ Memory: 0.5Gi ▼                    │
│ Port: 80                           │
│ Min Replicas: 0                    │
│ Max Replicas: 10                   │
│ ☑ Public Access (Ingress)          │
│ ☐ Allow HTTP (Insecure)            │
│ Environment Variables: [+]         │
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
- Sugerencia inteligente de nombre base: el primer App Service sugiere "myapp", los siguientes "myapp2", "myapp3", etc. El usuario puede editar el nombre base libremente.

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
- **🆕 Max Size configurable**: Tamaño máximo en bytes
- **🆕 Zone Redundant**: Alta disponibilidad con múltiples zonas
- **🆕 Mapeo automático**: Propiedades UI → Azure Bicep (edition→tier, serviceObjective→sku)
- **🆕 Asignación automática**: Referencia automática al SQL Server configurado
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

### 📊 Monitoring & Alerts (Application Insights)

Sistema de monitoreo con Application Insights y configuración de telemetría avanzada.

**Características:**

- **Nomenclatura Automática**: Sigue la convención `{appname}-{basename}-{environment}-ain`
- **Tipos de Aplicación**: Web, Mobile, Desktop (optimización de telemetría)
- **Acceso de Red Configurable**: Control de ingesta y consultas públicas/privadas
- **Retención de Datos**: 30-730 días configurable con slider interactivo
- **Integración Automática**: Se conecta automáticamente con otros recursos
- **Nombre Base Personalizable**: Campo específico para definir el propósito del monitoreo

**Valores por Defecto:**

- Tipo: `Web Application`
- Acceso Ingesta: `Habilitado`
- Acceso Consultas: `Habilitado`
- Retención: `90 días`
- Nombre Base: `webapp`

```text
┌─────────────────────────────────────┐
│ Application Insights Configuration  │
├─────────────────────────────────────┤
│ Base Name: webapp                  │
│ Full Name: myapp-webapp-dev-ain    │
│ Type: Web Application ▼            │
│ Ingestion Access: Enabled ▼        │
│ Query Access: Enabled ▼            │
│ Retention: 90 days [slider]        │
└─────────────────────────────────────┘
```

## 🏗️ Arquitectura del Proyecto

```text
InfraGen/
├── src/
│   ├── components/
│   │   ├── AzureSelector.vue          # Componente principal con validaciones (1000+ líneas)
│   │   ├── CostEstimator.vue          # Estimador de costos avanzado (550+ líneas)
│   │   ├── ContainerAppConfig.vue     # Config Container Apps (320+ líneas)
│   │   ├── StorageAccountConfig.vue   # Config Storage Account (160+ líneas)
│   │   ├── AppServiceConfig.vue       # Config App Service (180+ líneas)
│   │   ├── SqlDatabaseConfig.vue      # Config SQL Database (460+ líneas)
│   │   ├── FunctionAppConfig.vue      # Config Function App (270+ líneas)
│   │   ├── CognitiveServiceConfig.vue # Config Cognitive Services (140+ líneas)
│   │   ├── SQLServerConfig.vue        # Config SQL Server (130+ líneas)
│   │   └── MonitoringAlertsConfig.vue # Config Application Insights (230+ líneas)
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

- **Líneas de código**: ~5,000+ líneas (incluye Container Apps y nomenclatura automática)
- **Componentes Vue**: 10 componentes especializados (incluye ContainerAppConfig)
- **Recursos Azure**: 9 tipos completamente configurables (+ Container Apps)
- **Validaciones**: 25+ patrones de validación incluido sistema de dependencias
- **Configuraciones**: 120+ opciones únicas (incluye variables de entorno)
- **🔗 Dependencias**: Sistema completo de eliminación en cascada y asignación automática
- **📋 Mapeo de propiedades**: Traducción automática UI ↔ Azure Bicep
- **🏷️ Nomenclatura**: Convenciones automáticas con nombres base personalizables
- **💰 Sistema de Costos**: 35+ regiones con multiplicadores precisos
- **📊 Análisis de Costos**: 6 categorías de recursos con recomendaciones
- **📁 Formatos de Export**: 4 formatos de descarga (CSV, Excel, JSON, Print)
- **🐳 Container Apps**: Soporte completo para aplicaciones containerizadas

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

**Versión 2.1.0** - Actualizada con soporte para Azure Container Apps, nomenclatura automática para Application Insights con nombres base personalizables, y mejoras en la experiencia de usuario con validaciones inteligentes y configuración de variables de entorno dinámicas.
