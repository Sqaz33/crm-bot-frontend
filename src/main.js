import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { createPinia } from "pinia"

import "./assets/tailwind.css"
// import "./style.css" // уберём потом

const app = createApp(App)

app.use(createPinia())
app.use(router).mount("#app")
