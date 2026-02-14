import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
	components,
	directives,
	theme: {
		defaultTheme: 'light',
		themes: {
			light: {
				colors: {
					background: '#ECEFF4',
					surface: '#E5E9F0',
					primary: '#4C6A92',
					secondary: '#81A1C1',
					success: '#A3BE8C',
					warning: '#D08770',
					error: '#BF616A'
				}
			},
			dark: {
				colors: {
					background: '#2E3440',
					surface: '#3B4252',
					primary: '#5E81AC',
					secondary: '#81A1C1',
					success: '#A3BE8C',
					warning: '#EBCB8B',
					error: '#BF616A'
				}
			}
		}
	},
	defaults: {
		VTooltip: {
			openDelay: 200,
			closeDelay: 100,
			location: 'top'
		}
	}
})

createApp(App).use(vuetify).mount('#app')
