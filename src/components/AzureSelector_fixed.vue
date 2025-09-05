<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <h1 class="text-h4 text-center mb-2">Generador de Infraestructura Azure</h1>
        <h2 class="text-h6 text-center text-medium-emphasis">Selecciona los componentes y genera código Bicep</h2>
      </v-col>
    </v-row>

    <!-- Configuración Básica -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Configuración Básica</v-card-title>
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="appName"
                label="Nombre de la aplicación"
                hint="Ej: miapp"
                persistent-hint
                required
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-select
                v-model="environment"
                :items="environments"
                item-title="text"
                item-value="value"
                label="Ambiente"
                required
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-autocomplete
                v-model="location"
                :items="locations"
                item-title="displayName"
                item-value="name"
                label="Ubicación"
                required
              />
            </v-col>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="resourceGroup"
                label="Grupo de recursos"
                hint="Se genera automáticamente"
                persistent-hint
                readonly
              />
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Selector de Componentes -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Componentes Disponibles</v-card-title>
          <v-row>
            <v-col
              v-for="component in availableComponents"
              :key="component.value"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card
                :color="isConfigured(component.value) ? 'primary' : 'default'"
                :variant="isConfigured(component.value) ? 'flat' : 'outlined'"
                class="pa-3 text-center"
                style="height: 120px; cursor: pointer"
                @click="addComponent(component)"
              >
                <v-icon :icon="component.icon" size="32" class="mb-2" />
                <v-card-title class="text-body-1">{{ component.text }}</v-card-title>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Componentes Configurados -->
    <v-row v-if="configuredComponents.length > 0" class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Componentes Configurados</v-card-title>
          <v-expansion-panels v-model="expandedPanels" multiple>
            <v-expansion-panel
              v-for="(item, index) in configuredComponents"
              :key="index"
              :value="index"
            >
              <v-expansion-panel-title>
                <div class="d-flex align-center">
                  <v-icon :icon="getComponentIcon(item.value)" class="mr-3" />
                  <span>{{ getComponentText(item.value) }} - {{ item.config.name }}</span>
                  <v-spacer />
                  <v-chip v-if="item.config.environment" size="small" class="mr-2">
                    {{ item.config.environment }}
                  </v-chip>
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="d-flex justify-end mb-2">
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="primary"
                    class="mr-2"
                    @click="editComponent(index)"
                  >
                    Editar
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="outlined"
                    color="error"
                    @click="removeComponent(index)"
                  >
                    Eliminar
                  </v-btn>
                </div>
                <v-divider class="mb-3" />
                <div class="preview-details">
                  <v-row dense>
                    <v-col v-for="(value, key) in item.config" :key="key" cols="12" sm="6" md="4">
                      <v-chip size="small" variant="outlined" class="ma-1">
                        <strong>{{ key }}:</strong> {{ value }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-col>
    </v-row>

    <!-- Generar Bicep -->
    <v-row class="mb-4">
      <v-col cols="12">
        <v-card class="pa-4">
          <v-card-title>Generar Código Bicep</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              size="large"
              @click="generateBicep"
              :disabled="configuredComponents.length === 0"
              block
              class="mb-3"
            >
              <v-icon left>mdi-code-braces</v-icon>
              Generar Código Bicep
            </v-btn>
            
            <v-alert
              v-if="errorMsg"
              type="error"
              class="mb-3"
            >
              {{ errorMsg }}
            </v-alert>

            <div v-if="bicepContent" class="code-container">
              <div class="d-flex justify-end mb-2">
                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  class="mr-2"
                  @click="copyToClipboard"
                >
                  <v-icon left>mdi-content-copy</v-icon>
                  Copiar
                </v-btn>
                <v-btn
                  size="small"
                  variant="outlined"
                  color="primary"
                  @click="downloadBicep"
                >
                  <v-icon left>mdi-download</v-icon>
                  Descargar
                </v-btn>
              </div>
              <pre class="code-block"><code>{{ bicepContent }}</code></pre>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para configurar componentes -->
    <ConfigDialog
      :show="showConfigDialog"
      :component-type="selectedComponent?.value"
      :current-config="currentConfig"
      :app-name="appName"
      :environment="environment"
      :location="location"
      :configured-components="configuredComponents"
      @save="saveConfig"
      @cancel="cancelConfig"
      @update-config="updateCurrentConfig"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import ConfigDialog from './ConfigDialog.vue';
import locations from '../data/locations.json';
import environments from '../data/environments.json';

const appName = ref('');
const environment = ref('dev');
const location = ref('');
const showConfigDialog = ref(false);
const selectedComponent = ref(null);
const currentConfig = ref({});
const configuredComponents = ref([]);
const expandedPanels = ref([]);
const bicepContent = ref('');
const errorMsg = ref('');

const availableComponents = [
  { text: 'Storage Account', value: 'StorageAccount', icon: 'mdi-database' },
  { text: 'App Service Plan', value: 'AppServicePlan', icon: 'mdi-server' },
  { text: 'App Service', value: 'AppService', icon: 'mdi-web' },
  { text: 'SQL Server', value: 'SqlServer', icon: 'mdi-database-outline' },
  { text: 'SQL Database', value: 'SqlDatabase', icon: 'mdi-database-plus' },
  { text: 'Function App', value: 'FunctionApp', icon: 'mdi-lightning-bolt' }
];

const resourceGroup = computed(() => {
  if (!appName.value || !location.value) return '';
  
  const locationObj = locations.find(loc => loc.name === location.value);
  const shortName = locationObj?.shortName || 'unk';
  
  return `rg${shortName}${appName.value}`;
});

const isConfigured = (componentType) => {
  return configuredComponents.value.some(item => item.value === componentType);
};

const getComponentIcon = (componentType) => {
  const component = availableComponents.find(comp => comp.value === componentType);
  return component?.icon || 'mdi-cube';
};

const getComponentText = (componentType) => {
  const component = availableComponents.find(comp => comp.value === componentType);
  return component?.text || componentType;
};

const updateCurrentConfig = (newConfig) => {
  const hasChanges = Object.keys(newConfig).some(key => 
    currentConfig.value[key] !== newConfig[key]
  );
  if (hasChanges) {
    currentConfig.value = { ...newConfig };
  }
};

const addComponent = (component) => {
  selectedComponent.value = component;
  currentConfig.value = {};
  showConfigDialog.value = true;
};

const editComponent = (index) => {
  const item = configuredComponents.value[index];
  selectedComponent.value = availableComponents.find(comp => comp.value === item.value);
  currentConfig.value = { ...item.config };
  showConfigDialog.value = true;
};

const removeComponent = (index) => {
  configuredComponents.value.splice(index, 1);
};

const saveConfig = (config) => {
  const existingIndex = configuredComponents.value.findIndex(
    item => item.value === selectedComponent.value.value && item.config.name === config.name
  );
  
  if (existingIndex !== -1) {
    configuredComponents.value[existingIndex].config = config;
  } else {
    configuredComponents.value.push({
      value: selectedComponent.value.value,
      config: config
    });
  }
  
  showConfigDialog.value = false;
  selectedComponent.value = null;
  currentConfig.value = {};
};

const cancelConfig = () => {
  showConfigDialog.value = false;
  selectedComponent.value = null;
  currentConfig.value = {};
};

const generateBicep = () => {
  let content = '';
  errorMsg.value = '';

  if (!appName.value) {
    errorMsg.value = 'El nombre de la aplicación es obligatorio.';
    return;
  }
  if (!resourceGroup.value) {
    errorMsg.value = 'El grupo de recursos es obligatorio.';
    return;
  }
  if (!location.value) {
    errorMsg.value = 'La ubicación es obligatoria.';
    return;
  }

  if (configuredComponents.value.length === 0) {
    bicepContent.value = '';
    errorMsg.value = 'Agrega al menos un componente para generar el archivo Bicep.';
    return;
  }

  // Header del archivo Bicep
  content += `targetScope = 'subscription'

`;
  content += `// Variables comunes
`;
  content += `var location = '${location.value}'
`;
  content += `var appName = '${appName.value}'
`;
  content += `var environment = '${environment.value}'
`;
  content += `var resourceGroupName = '${resourceGroup.value}'
`;
  content += `var tags = {
`;
  content += `  Environment: environment
`;
  content += `  Application: appName
`;
  content += `}

`;

  // Crear resource group si no existe
  content += `// Crear Resource Group
`;
  content += `resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
`;
  content += `  name: resourceGroupName
`;
  content += `  location: location
`;
  content += `  tags: tags
`;
  content += `}

`;

  // Generar cada componente
  configuredComponents.value.forEach((item) => {
    const cfg = item.config;
    
    if (item.value === 'StorageAccount') {
      content += `// Storage Account ${cfg.name}
resource storageAccount_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  scope: resourceGroup
  name: '${cfg.name}'
  location: location
  sku: {
    name: '${cfg.sku || 'Standard_LRS'}'
  }
  kind: '${cfg.kind || 'StorageV2'}'
  properties: {
    accessTier: '${cfg.accessTier || 'Hot'}'
    supportsHttpsTrafficOnly: ${cfg.httpsOnly !== false}
    allowBlobPublicAccess: ${cfg.enableBlobPublicAccess === true}
    minimumTlsVersion: 'TLS1_2'
  }
  tags: tags
}

`;
    }
    
    if (item.value === 'AppServicePlan') {
      content += `// App Service Plan ${cfg.name}
resource appServicePlan_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Web/serverfarms@2022-03-01' = {
  scope: resourceGroup
  name: '${cfg.name}'
  location: location
  sku: {
    name: '${cfg.sku || 'B1'}'
  }
  kind: '${cfg.os === 'Windows' ? 'app' : 'linux'}'
  properties: {
    reserved: ${cfg.os !== 'Windows'}
    perSiteScaling: ${cfg.perSiteScaling === true}`;
      
      if (cfg.zoneRedundant && cfg.sku && cfg.sku.startsWith('P')) {
        content += `
    zoneRedundant: ${cfg.zoneRedundant}`;
      }
      
      if (cfg.maximumElasticWorkerCount && ['P1v2', 'P2v2', 'P3v2', 'P1v3', 'P2v3', 'P3v3'].includes(cfg.sku)) {
        content += `
    maximumElasticWorkerCount: ${cfg.maximumElasticWorkerCount}`;
      }
      
      content += `
  }
  tags: tags
}

`;
    }
    
    if (item.value === 'AppService') {
      content += `// App Service ${cfg.name}
resource appService_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Web/sites@2022-03-01' = {
  scope: resourceGroup
  name: '${cfg.name}'
  location: location
  properties: {
    serverFarmId: appServicePlan_${cfg.appServicePlan.replace(/[^a-zA-Z0-9]/g, '')}.id
    siteConfig: {`;
    
      if (cfg.runtime) {
        const [stack, version] = cfg.runtime.split('|');
        if (stack === 'dotnetcore') {
          content += `
      netFrameworkVersion: 'v${version}'`;
        } else if (stack === 'node') {
          content += `
      nodeVersion: '${version}'`;
        } else if (stack === 'python') {
          content += `
      pythonVersion: '${version}'`;
        } else if (stack === 'java') {
          content += `
      javaVersion: '${version}'`;
        } else if (stack === 'php') {
          content += `
      phpVersion: '${version}'`;
        }
      }
      
      content += `
      alwaysOn: ${cfg.alwaysOn === true}
      httpLoggingEnabled: ${cfg.httpLogging === true}
      requestTracingEnabled: ${cfg.requestTracing === true}
      detailedErrorLoggingEnabled: ${cfg.detailedErrors === true}
    }
    httpsOnly: ${cfg.httpsOnly !== false}
    clientAffinityEnabled: ${cfg.clientAffinity !== false}
  }
  tags: tags
}

`;
    }
    
    if (item.value === 'SqlServer') {
      content += `// SQL Server ${cfg.name}
resource sqlServer_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Sql/servers@2022-05-01-preview' = {
  scope: resourceGroup
  name: '${cfg.name}'
  location: location
  properties: {
    administratorLogin: '${cfg.adminUsername}'
    administratorLoginPassword: '${cfg.adminPassword}'
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: '${cfg.allowAzureServices ? 'Enabled' : 'Disabled'}'
  }
  tags: tags
}

`;
      
      if (cfg.allowAzureServices) {
        content += `// Firewall rule para servicios de Azure
resource sqlFirewallAzure_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Sql/servers/firewallRules@2022-05-01-preview' = {
  parent: sqlServer_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')}
  name: 'AllowAllWindowsAzureIps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

`;
      }
    }
    
    if (item.value === 'SqlDatabase') {
      content += `// SQL Database ${cfg.name}
resource sqlDatabase_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Sql/servers/databases@2022-05-01-preview' = {
  parent: sqlServer_${cfg.sqlServer.replace(/[^a-zA-Z0-9]/g, '')}
  name: '${cfg.name}'
  location: location
  sku: {
    name: '${cfg.sku}'`;
    
      if (cfg.tier) content += `
    tier: '${cfg.tier}'`;
      if (cfg.capacity) content += `
    capacity: ${cfg.capacity}`;
      
      content += `
  }
  properties: {`;
    
      if (cfg.maxSizeBytes) content += `
    maxSizeBytes: ${cfg.maxSizeBytes}`;
      
      content += `
    collation: '${cfg.collation || 'SQL_Latin1_General_CP1_CI_AS'}'
  }
  tags: tags
}

`;
    }
    
    if (item.value === 'FunctionApp') {
      content += `// Function App ${cfg.name}
resource functionApp_${cfg.name.replace(/[^a-zA-Z0-9]/g, '')} 'Microsoft.Web/sites@2022-03-01' = {
  scope: resourceGroup
  name: '${cfg.name}'
  location: location
  kind: 'functionapp'
  properties: {
    serverFarmId: appServicePlan_${cfg.appServicePlan.replace(/[^a-zA-Z0-9]/g, '')}.id
    siteConfig: {`;
    
      if (cfg.runtime) {
        const [stack, version] = cfg.runtime.split('|');
        if (stack === 'dotnet') {
          content += `
      netFrameworkVersion: 'v${version}'`;
        } else if (stack === 'node') {
          content += `
      nodeVersion: '~${version}'`;
        } else if (stack === 'python') {
          content += `
      pythonVersion: '${version}'`;
        } else if (stack === 'java') {
          content += `
      javaVersion: '${version}'`;
        } else if (stack === 'powershell') {
          content += `
      powerShellVersion: '${version}'`;
        }
      }
      
      content += `
      use32BitWorkerProcess: ${cfg.use32Bit === true}
      ftpsState: '${cfg.ftpsState || 'FtpsOnly'}'
    }
    httpsOnly: ${cfg.httpsOnly !== false}
  }
  tags: tags
}

`;
    }
  });

  bicepContent.value = content;
};

const downloadBicep = () => {
  const blob = new Blob([bicepContent.value], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${appName.value}-infrastructure.bicep`;
  link.click();
  URL.revokeObjectURL(link.href);
};

const copyToClipboard = () => {
  navigator.clipboard.writeText(bicepContent.value).then(() => {
    console.log('Código copiado al portapapeles');
  }).catch(err => {
    console.error('Error al copiar:', err);
  });
};
</script>

<style scoped>
.code-container {
  background-color: #1e1e1e;
  border-radius: 4px;
  overflow: hidden;
}

.code-block {
  background-color: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  padding: 16px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
  text-align: left;
}

.code-block code {
  background: none;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
}
</style>
