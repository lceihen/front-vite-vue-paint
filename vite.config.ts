import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	server: {
		open: true
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
