<template>
  <v-card class="mb-4" flat>
    <v-card-title class="text-subtitle-1 py-2">Configurar SQL Database</v-card-title>
    <v-card-text class="pt-2">
      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.databaseName" 
            label="Nombre de la Base de Datos" 
            placeholder="Ej: mydatabase" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.databaseNameFormat]"
            hint="Solo letras, números, guiones y guiones bajos"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.serverName" 
            label="Nombre del SQL Server" 
            placeholder="Ej: myserver" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.serverNameFormat]"
            hint="Solo letras minúsculas, números y guiones"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.adminUsername" 
            label="Usuario Administrador" 
            placeholder="Ej: sqladmin" 
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.adminUsernameFormat]"
            hint="No puede ser 'admin', 'administrator', 'sa', etc."
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field 
            v-model="config.adminPassword" 
            label="Contraseña del Administrador" 
            placeholder="Contraseña segura" 
            type="password"
            density="compact" 
            variant="outlined"
            :rules="[rules.required, rules.passwordFormat]"
            hint="Mínimo 8 caracteres: 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.edition"
            :items="editionOptions"
            label="Edición de la Base de Datos"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Nivel de rendimiento y características"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.serviceObjective"
            :items="getServiceObjectiveOptions()"
            label="Objetivo de Servicio"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="DTU o vCore según la edición"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" md="6">
          <v-select
            v-model="config.collation"
            :items="collationOptions"
            label="Collation"
            item-title="label"
            item-value="value"
            density="compact"
            variant="outlined"
            hint="Reglas de ordenamiento y comparación"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex flex-column">
          <v-switch
            v-model="config.enableFirewallRules"
            label="Habilitar reglas de Firewall"
            density="compact"
            color="primary"
            hint="Permitir acceso desde Azure y IPs específicas"
            persistent-hint
            class="mb-1"
          />
          <v-switch
            v-model="config.enableThreatDetection"
            label="Detección de Amenazas"
            density="compact"
            color="primary"
            hint="Advanced Threat Protection"
            persistent-hint
          />
        </v-col>
      </v-row>

      <v-row dense v-if="config.enableFirewallRules">
        <v-col cols="12">
          <v-text-field 
            v-model="config.allowedIpRanges" 
            label="Rangos de IP Permitidos (opcional)" 
            placeholder="Ej: 192.168.1.0-192.168.1.255" 
            density="compact" 
            variant="outlined"
            hint="Formato: IP_INICIO-IP_FIN, separados por comas"
            persistent-hint
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  config: {
    type: Object,
    required: true
  }
})

// Inicializar valores por defecto si no existen
if (!props.config.databaseName) props.config.databaseName = props.config.name || 'mydatabase'
if (!props.config.serverName) props.config.serverName = `${props.config.name || 'myserver'}-server`
if (!props.config.adminUsername) props.config.adminUsername = 'sqladmin'
if (!props.config.adminPassword) props.config.adminPassword = ''
if (!props.config.edition) props.config.edition = 'Basic'
if (!props.config.serviceObjective) props.config.serviceObjective = 'Basic'
if (!props.config.collation) props.config.collation = 'SQL_Latin1_General_CP1_CI_AS'
if (props.config.enableFirewallRules === undefined) props.config.enableFirewallRules = true
if (props.config.enableThreatDetection === undefined) props.config.enableThreatDetection = false
if (!props.config.allowedIpRanges) props.config.allowedIpRanges = ''

const editionOptions = [
  { label: 'Basic (Desarrollo/Testing)', value: 'Basic' },
  { label: 'Standard (Aplicaciones Generales)', value: 'Standard' },
  { label: 'Premium (Alto Rendimiento)', value: 'Premium' },
  { label: 'GeneralPurpose (vCore)', value: 'GeneralPurpose' },
  { label: 'BusinessCritical (vCore)', value: 'BusinessCritical' },
  { label: 'Hyperscale (vCore)', value: 'Hyperscale' }
]

const serviceObjectiveOptions = {
  Basic: [
    { label: 'Basic (5 DTU)', value: 'Basic' }
  ],
  Standard: [
    { label: 'S0 (10 DTU)', value: 'S0' },
    { label: 'S1 (20 DTU)', value: 'S1' },
    { label: 'S2 (50 DTU)', value: 'S2' },
    { label: 'S3 (100 DTU)', value: 'S3' },
    { label: 'S4 (200 DTU)', value: 'S4' }
  ],
  Premium: [
    { label: 'P1 (125 DTU)', value: 'P1' },
    { label: 'P2 (250 DTU)', value: 'P2' },
    { label: 'P4 (500 DTU)', value: 'P4' },
    { label: 'P6 (1000 DTU)', value: 'P6' }
  ],
  GeneralPurpose: [
    { label: 'GP_Gen5_2 (2 vCore)', value: 'GP_Gen5_2' },
    { label: 'GP_Gen5_4 (4 vCore)', value: 'GP_Gen5_4' },
    { label: 'GP_Gen5_8 (8 vCore)', value: 'GP_Gen5_8' }
  ],
  BusinessCritical: [
    { label: 'BC_Gen5_2 (2 vCore)', value: 'BC_Gen5_2' },
    { label: 'BC_Gen5_4 (4 vCore)', value: 'BC_Gen5_4' },
    { label: 'BC_Gen5_8 (8 vCore)', value: 'BC_Gen5_8' }
  ],
  Hyperscale: [
    { label: 'HS_Gen5_2 (2 vCore)', value: 'HS_Gen5_2' },
    { label: 'HS_Gen5_4 (4 vCore)', value: 'HS_Gen5_4' },
    { label: 'HS_Gen5_8 (8 vCore)', value: 'HS_Gen5_8' }
  ]
}

const collationOptions = [
  { label: 'SQL_Latin1_General_CP1_CI_AS (Predeterminado)', value: 'SQL_Latin1_General_CP1_CI_AS' },
  { label: 'Spanish_Modern_Sort_CI_AS', value: 'Spanish_Modern_Sort_CI_AS' },
  { label: 'Latin1_General_CI_AS', value: 'Latin1_General_CI_AS' },
  { label: 'SQL_Latin1_General_CP1_CS_AS (Case Sensitive)', value: 'SQL_Latin1_General_CP1_CS_AS' }
]

function getServiceObjectiveOptions() {
  return serviceObjectiveOptions[props.config.edition] || serviceObjectiveOptions.Basic
}

const rules = {
  required: value => !!value || 'Este campo es obligatorio',
  databaseNameFormat: value => {
    if (!value) return true
    const regex = /^[a-zA-Z0-9_-]+$/
    return regex.test(value) || 'Solo letras, números, guiones y guiones bajos'
  },
  serverNameFormat: value => {
    if (!value) return true
    const regex = /^[a-z0-9-]+$/
    return regex.test(value) || 'Solo letras minúsculas, números y guiones'
  },
  adminUsernameFormat: value => {
    if (!value) return true
    const forbidden = ['admin', 'administrator', 'sa', 'root', 'dbmanager', 'loginmanager', 'dbo', 'guest', 'public']
    if (forbidden.includes(value.toLowerCase())) {
      return 'No se permiten nombres reservados como admin, administrator, sa, etc.'
    }
    const regex = /^[a-zA-Z][a-zA-Z0-9_]{0,127}$/
    return regex.test(value) || 'Debe empezar con letra, solo letras, números y guión bajo'
  },
  passwordFormat: value => {
    if (!value) return true
    if (value.length < 8) return 'Mínimo 8 caracteres'
    if (!/(?=.*[a-z])/.test(value)) return 'Debe contener al menos una letra minúscula'
    if (!/(?=.*[A-Z])/.test(value)) return 'Debe contener al menos una letra mayúscula'
    if (!/(?=.*\d)/.test(value)) return 'Debe contener al menos un número'
    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(value)) return 'Debe contener al menos un carácter especial (!@#$%^&*()_+-=[]{}|;:,.<>?)'
    return true
  }
}
</script>


