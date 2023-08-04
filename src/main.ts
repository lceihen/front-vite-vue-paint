import { createApp } from 'vue'
import './index.css'
import RouterConfig from '@/router/index'
// @ts-ignore
import App from './App.vue'

// import VConsole from 'vconsole'

// new VConsole()

// 123

createApp(App).use(RouterConfig).mount('#app')

fetch('version')
	.then((response) => response.text())
	.then((data) => {
		const res = data.split(' |')
		res.forEach((logItem) => {
			const [hash, title, date] = logItem.replace('\n', '').split('**')
			if (!hash) return
			console.log(
				`%c ${hash} %c ${title} %c${date}`,
				'padding: 2px 1px; border-radius: 3px 0 0 3px; color: #fff; background: #606060;',
				'padding: 2px 1px;  color: #fff; background: #42c02e;',
				'padding: 2px 1px; border-radius: 0px 3px 3px 0px; color: #fff; background: #6c80ce;'
			)
		})
	})
