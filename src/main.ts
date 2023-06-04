import { createApp } from 'vue'
import './index.css'
import RouterConfig from '@/router/index'
// @ts-ignore
import App from './App.vue'

// import VConsole from 'vconsole'

// new VConsole()

createApp(App).use(RouterConfig).mount('#app')
