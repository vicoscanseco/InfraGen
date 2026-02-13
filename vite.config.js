import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        // Separar vendors por dominio funcional para mejorar caché y reducir el chunk principal.
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@vue-flow')) return 'vendor-vueflow'
          if (id.includes('vuetify')) return 'vendor-vuetify'
          if (id.includes('@mdi') || id.includes('materialdesignicons')) return 'vendor-mdi'
          if (id.includes('vue')) return 'vendor-vue'

          return 'vendor-misc'
        }
      }
    }
  }
})
