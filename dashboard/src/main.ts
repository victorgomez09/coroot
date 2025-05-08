/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from '@/App.vue'

// Utils
import Api from '@/api'
import * as storage from '@/utils/storage'
import * as validators from '@/utils/validators'
import * as events from '@/utils/events'
import router from '@/router'
import Utils from '@/utils/utils'

// Composables
import { createApp } from 'vue'

// Styles
import 'unfonts.css'

const app = createApp(App)
const api = new Api(router);

app.provide('$api', api);
app.provide('$storage', storage);
app.provide('$validators', validators);
app.provide('$events', events);
app.provide('$utils', new Utils(router))

registerPlugins(app)

app.mount('#app')
