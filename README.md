# InfraGen - Generador de Infraestructura Azure

Una aplicación web moderna construida con Vue.js 3 y Vuetify 3 que permite seleccionar y configurar recursos de Azure para generar código Bicep de manera visual e intuitiva.

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=flat-square&logo=vue.js)
![Vuetify](https://img.shields.io/badge/Vuetify-3.x-1867C0?style=flat-square&logo=vuetify)
![Azure](https://img.shields.io/badge/Azure-Bicep-0078D4?style=flat-square&logo=microsoft-azure)

## 🚀 Características

- **Interfaz moderna**: UI intuitiva con Vuetify 3 y Material Design
- **Configuración visual**: Selección y configuración de recursos Azure sin código
- **Generación automática**: Código Bicep profesional con mejores prácticas
- **Validaciones robustas**: Verificación de nombres, formatos y configuraciones
- **Sistema modular**: Componentes especializados para cada tipo de recurso
- **Vista previa de código**: Visualización con tema oscuro tipo VS Code

## 📋 Recursos Soportados

### 🗄️ Storage Account

Configuración completa de cuentas de almacenamiento con opciones de SKU, tipo de acceso y políticas de seguridad.

**Características:**

- Múltiples SKUs (Standard/Premium)
- Tipos de almacenamiento (BlobStorage, StorageV2, etc.)
- Configuración de acceso público
- Habilitación de HTTPS forzado

```text
┌─────────────────────────────────────┐
│ Storage Account Configuration       │
├─────────────────────────────────────┤
│ Name: mystorageaccount             │
│ SKU: Standard_LRS ▼                │
│ Kind: StorageV2 ▼                  │
│ Access Tier: Hot ▼                 │
│ ☑ Enable HTTPS Traffic Only        │
│ ☐ Allow Public Access             │
└─────────────────────────────────────┘
```

### 🌐 App Service

Configuración detallada de App Services con planes de servicio y configuraciones de runtime.

**Características:**

- 11+ opciones de SKU (Free, Shared, Basic, Standard, Premium)
- Múltiples runtime stacks (Node.js, .NET, Python, Java, PHP)
- Configuración de OS (Windows/Linux)
- Opciones de escalado automático
- Configuración de slots de deployment

```text
┌─────────────────────────────────────┐
│ App Service Configuration           │
├─────────────────────────────────────┤
│ Name: mywebapp                     │
│ SKU: S1 ▼                          │
│ Runtime: Node.js 18 ▼              │
│ OS: Linux ▼                        │
│ ☑ Always On                       │
│ ☑ HTTPS Only                      │
└─────────────────────────────────────┘
```

### 🗃️ SQL Database

Sistema completo de base de datos SQL con servidor, configuraciones de seguridad y firewall.

**Características:**

- Configuración de SQL Server completa
- Opciones DTU y vCore
- 50+ collations disponibles
- Reglas de firewall automáticas
- Threat Detection habilitado
- Validación robusta de contraseñas

```text
┌─────────────────────────────────────┐
│ SQL Database Configuration          │
├─────────────────────────────────────┤
│ Server: mysqlserver                │
│ Database: mydatabase               │
│ Admin User: sqladmin               │
│ Password: ************             │
│ SKU: Basic ▼                       │
│ Collation: SQL_Latin1_General... ▼ │
│ ☑ Enable Threat Detection          │
│ ☑ Allow Azure Services Access      │
└─────────────────────────────────────┘
```

### ⚡ Function App

Configuración avanzada de Azure Functions con diferentes planes de hosting.

**Características:**

- 3 tipos de planes (Consumption, Premium, Dedicated)
- SKUs dinámicos según el plan seleccionado
- Runtime stacks especializados (.NET, Node.js, Python, Java)
- Application Insights integrado
- Storage Account automático
- Configuración de instancias pre-calentadas

```text
┌─────────────────────────────────────┐
│ Function App Configuration          │
├─────────────────────────────────────┤
│ Name: myfunctionapp                │
│ Hosting: Consumption Plan ▼        │
│ Runtime: .NET 8 ▼                  │
│ OS: Windows ▼                      │
│ ☑ Application Insights             │
│ ☑ Create Storage Account           │
└─────────────────────────────────────┘
```

## 🏗️ Arquitectura del Proyecto

```
InfraGen/
├── src/
│   ├── components/
│   │   ├── AzureSelector.vue          # Componente principal (678 líneas)
│   │   ├── StorageAccountConfig.vue   # Config Storage (136 líneas)
│   │   ├── AppServiceConfig.vue       # Config App Service (159 líneas)
│   │   ├── SqlDatabaseConfig.vue      # Config SQL Database (250 líneas)
│   │   └── FunctionAppConfig.vue      # Config Function App (249 líneas)
│   ├── data/
│   │   ├── environments.json          # Entornos disponibles
│   │   └── locations.json             # 30 regiones Azure
│   ├── App.vue                        # Componente raíz
│   └── main.js                        # Configuración Vuetify
├── package.json
└── README.md
```

## 🛠️ Tecnologías Utilizadas

- **Vue.js 3**: Framework reactivo con Composition API
- **Vuetify 3**: Biblioteca de componentes Material Design
- **Vite**: Herramienta de build rápida
- **JavaScript ES6+**: Sintaxis moderna y módulos

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

1. **Seleccionar Ambiente y Ubicación**: Elige el entorno de deployment y la región Azure
2. **Configurar Resource Group**: Define el nombre del grupo de recursos (obligatorio)
3. **Agregar Componentes**: Selecciona los recursos desde la lista de disponibles
4. **Configurar Recursos**: Personaliza cada recurso con sus opciones específicas
5. **Generar Bicep**: Visualiza y copia el código generado

## 🎯 Flujo de Trabajo

```text
[Seleccionar Ambiente] → [Elegir Ubicación] → [Configurar Resource Group]
            ↓
[Agregar Componentes] → [Configurar Recursos] → [Generar Bicep] → [Copiar Código]
```

## 🔧 Configuración Avanzada

### Ambientes Personalizados

Edita `src/data/environments.json` para agregar nuevos entornos:

```json
{
  "environments": ["Development", "Testing", "Staging", "Production", "CustomEnv"]
}
```

### Regiones Adicionales

Modifica `src/data/locations.json` para incluir nuevas regiones Azure.

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~1,655 líneas
- **Componentes Vue**: 7 componentes
- **Recursos Azure**: 4 tipos completamente configurables
- **Validaciones**: 15+ patrones de validación
- **Configuraciones**: 50+ opciones únicas

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevoRecurso`)
3. Commit tus cambios (`git commit -m 'Add: Nuevo recurso Azure'`)
4. Push a la rama (`git push origin feature/NuevoRecurso`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Victor Canseco

- GitHub: [@vicoscanseco](https://github.com/vicoscanseco)

---

⭐ Si este proyecto te fue útil, no olvides darle una estrella en GitHub!
