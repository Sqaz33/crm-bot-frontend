import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { LoggerPlugin } from './utils/logger'
import './style.css';

import "./assets/tailwind.css"
// import "./style.css" // уберём потом

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)

app.use(LoggerPlugin)



app.use(router).mount('#app')
