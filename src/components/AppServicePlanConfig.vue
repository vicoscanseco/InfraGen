<template>
  <v-card class="mb-4">
    <v-card-title class="bg-primary">
      <v-icon class="mr-2">mdi-server</v-icon>
      App Service Plan Configuration
    </v-card-title>
    <v-card-text>
      <v-row>
        <!-- Name (Auto-generated) -->
        <v-col cols="12" md="6">
          <v-text-field
            v-model="config.name"
            label="App Service Plan Name"
            hint="Format: appname-environment-asp"
            persistent-hint
            readonly
            prepend-icon="mdi-tag"
          />
        </v-col>

        <!-- SKU -->
        <v-col cols="12" md="6">
          <v-select
            v-model="config.sku"
            label="SKU"
            :items="skuOptions"
            item-title="name"
            item-value="value"
            prepend-icon="mdi-speedometer"
            @update:model-value="updateParent"
          >
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <v-list-item-title>{{ item.raw.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.description }}</v-list-item-subtitle>
              </v-list-item>
            </template>
          </v-select>
        </v-col>

        <!-- Operating System -->
        <v-col cols="12" md="6">
          <v-select
            v-model="config.os"
            label="Operating System"
            :items="osOptions"
            prepend-icon="mdi-desktop-classic"
            @update:model-value="updateParent"
          />
        </v-col>

        <!-- Per App Scaling -->
        <v-col cols="12" md="6">
          <v-switch
            v-model="config.perSiteScaling"
            label="Per App Scaling"
            color="primary"
            hide-details
            @update:model-value="updateParent"
          />
          <small class="text-grey">Enable individual app scaling within the plan</small>
        </v-col>

        <!-- Zone Redundancy (Premium only) -->
        <v-col cols="12" md="6" v-if="isPremiumSku">
          <v-switch
            v-model="config.zoneRedundant"
            label="Zone Redundant"
            color="primary"
            hide-details
            @update:model-value="updateParent"
          />
          <small class="text-grey">Deploy across availability zones</small>
        </v-col>

        <!-- Maximum Elastic Worker Count -->
        <v-col cols="12" md="6" v-if="isElasticSku">
          <v-text-field
            v-model.number="config.maximumElasticWorkerCount"
            label="Maximum Elastic Workers"
            type="number"
            min="1"
            max="20"
            prepend-icon="mdi-account-multiple"
            @update:model-value="updateParent"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'AppServicePlanConfig',
  props: {
    modelValue: {
      type: Object,
      default: () => ({})
    },
    appName: {
      type: String,
      default: 'myapp'
    },
    environment: {
      type: String,
      default: 'dev'
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      config: {
        name: '',
        sku: 'B1',
        os: 'Windows',
        perSiteScaling: false,
        zoneRedundant: false,
        maximumElasticWorkerCount: 1,
        ...this.modelValue
      },
      skuOptions: [
        // Free Tier
        { name: 'F1 - Free', value: 'F1', description: 'Free tier - 1GB RAM, 60 min/day' },
        
        // Shared Tier
        { name: 'D1 - Shared', value: 'D1', description: 'Shared tier - 1GB RAM, 240 min/day' },
        
        // Basic Tier
        { name: 'B1 - Basic Small', value: 'B1', description: 'Basic - 1 core, 1.75GB RAM' },
        { name: 'B2 - Basic Medium', value: 'B2', description: 'Basic - 2 cores, 3.5GB RAM' },
        { name: 'B3 - Basic Large', value: 'B3', description: 'Basic - 4 cores, 7GB RAM' },
        
        // Standard Tier
        { name: 'S1 - Standard Small', value: 'S1', description: 'Standard - 1 core, 1.75GB RAM' },
        { name: 'S2 - Standard Medium', value: 'S2', description: 'Standard - 2 cores, 3.5GB RAM' },
        { name: 'S3 - Standard Large', value: 'S3', description: 'Standard - 4 cores, 7GB RAM' },
        
        // Premium V2 Tier
        { name: 'P1v2 - Premium Small', value: 'P1v2', description: 'Premium V2 - 1 core, 3.5GB RAM' },
        { name: 'P2v2 - Premium Medium', value: 'P2v2', description: 'Premium V2 - 2 cores, 7GB RAM' },
        { name: 'P3v2 - Premium Large', value: 'P3v2', description: 'Premium V2 - 4 cores, 14GB RAM' },
        
        // Premium V3 Tier
        { name: 'P1v3 - Premium V3 Small', value: 'P1v3', description: 'Premium V3 - 2 cores, 8GB RAM' },
        { name: 'P2v3 - Premium V3 Medium', value: 'P2v3', description: 'Premium V3 - 4 cores, 16GB RAM' },
        { name: 'P3v3 - Premium V3 Large', value: 'P3v3', description: 'Premium V3 - 8 cores, 32GB RAM' }
      ],
      osOptions: ['Windows', 'Linux']
    }
  },
  computed: {
    isPremiumSku() {
      return this.config.sku.startsWith('P')
    },
    isElasticSku() {
      return ['P1v2', 'P2v2', 'P3v2', 'P1v3', 'P2v3', 'P3v3'].includes(this.config.sku)
    }
  },
  watch: {
    appName: {
      immediate: true,
      handler() {
        this.updateName()
      }
    },
    environment: {
      immediate: true,
      handler() {
        this.updateName()
      }
    },
    modelValue: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          // Solo actualizar si los valores realmente han cambiado
          const hasChanges = Object.keys(newVal).some(key => 
            this.config[key] !== newVal[key]
          )
          if (hasChanges) {
            this.config = { ...this.config, ...newVal }
          }
        }
      }
    }
  },
  methods: {
    updateName() {
      const appName = this.appName.toLowerCase().replace(/[^a-z0-9]/g, '')
      const env = this.environment.toLowerCase()
      const newName = `${appName}-${env}-asp`
      
      // Solo actualizar si el nombre realmente ha cambiado
      if (this.config.name !== newName) {
        this.config.name = newName
        this.updateParent()
      }
    },
    updateParent() {
      this.$emit('update:modelValue', { ...this.config })
    },
    isValid() {
      return this.config.name && 
             this.config.sku && 
             this.config.os &&
             this.config.name.length >= 3 &&
             this.config.name.length <= 60 &&
             /^[a-zA-Z0-9-]+$/.test(this.config.name)
    }
  }
}
</script>
