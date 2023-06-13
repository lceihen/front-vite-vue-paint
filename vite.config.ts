import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],

	server: {
		host: '0.0.0.0',
		open: true,
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true
			}
		}
	},
	resolve: {
		alias: [
			{
				find: '@',
				replacement: path.resolve('./src')
			}
		]
	}
})
