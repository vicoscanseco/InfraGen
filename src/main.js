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
					background: '#EEF2F7',
					surface: '#FFFFFF',
					primary: '#0369A1',
					secondary: '#0284C7',
					success: '#15803D',
					warning: '#B45309',
					error: '#B91C1C',
					info: '#4F46E5'
				}
			},
			dark: {
				colors: {
					background: '#060D1A',
					surface: '#0C1525',
					primary: '#0EA5E9',
					secondary: '#7DD3FC',
					success: '#4ADE80',
					warning: '#FCD34D',
					error: '#F87171',
					info: '#818CF8'
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
