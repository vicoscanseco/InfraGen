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
					primary: '#0078D4',
					secondary: '#106EBE', 
					success: '#107C10',
					warning: '#FF8C00',
					error: '#D13438'
				}
			},
			dark: {
				colors: {
					background: '#121212',
					surface: '#1E1E1E',
					primary: '#4EA1F3',
					secondary: '#2B88D8',
					success: '#5BCB5B',
					warning: '#FFB347',
					error: '#F1707B'
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
