import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// 添加持久化插件
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.mount('#app')