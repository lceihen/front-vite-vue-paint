import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],

	server: {
		open: true,
		proxy: {
			'/api': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true
			},
			'/api/': {
				target: 'http://127.0.0.1:3000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api\/userInfo/, '/userInfo')
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
