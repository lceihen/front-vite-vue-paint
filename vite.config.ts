import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as path from 'path'

export default defineConfig(({ mode }) => {
	return {
		plugins: [vue()],

		server: {
			host: '0.0.0.0',
			open: true,
			port: 8087
		},
		resolve: {
			alias: [
				{
					find: '@',
					replacement: path.resolve('./src')
				}
			]
		},
		base:
			mode === 'development'
				? ''
				: 'https://lcsubappassets.oss-cn-guangzhou.aliyuncs.com/canvas/'
	}
})
