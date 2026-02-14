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
					background: '#F6F8FA',
					surface: '#FFFFFF',
					primary: '#0969DA',
					secondary: '#1F6FEB',
					success: '#1A7F37',
					warning: '#9A6700',
					error: '#CF222E'
				}
			},
			dark: {
				colors: {
					background: '#0D1117',
					surface: '#161B22',
					primary: '#58A6FF',
					secondary: '#79C0FF',
					success: '#3FB950',
					warning: '#D29922',
					error: '#F85149'
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
