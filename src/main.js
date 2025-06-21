import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

const app = createApp(App)


const pinia = createPinia()
app.use(pinia)


app.component('VueDatePicker', VueDatePicker)


app.use(router).mount('#app')
