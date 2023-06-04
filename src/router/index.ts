import { createRouter, createWebHistory } from 'vue-router'
import Cookies from 'js-cookie'
import { authConfig } from '@/config'
import Layout from '@/pages/Layout/index.vue'
import Error from '@/pages/Error/index.vue'
import { getToken, getUserInfo } from '@/api'
// import Layout from '@/pages/Layout'
// const Layout = () => import('@/pages/Layout/index.vue')

const routes = [
	{ path: '/', name: 'orderFill', component: Layout },

	{ path: '/error', name: 'error', component: Error }
]
const router = createRouter({
	history: createWebHistory(),
	routes
})

router.beforeEach(async (to, from, next) => {
	console.log('phone', Cookies.get('phone'))
	const _userName = Cookies.get('userName')
	const _token = Cookies.get('token')
	const { prodUrl, authUrl, clientId, secret } = authConfig
	const redirectUri = encodeURIComponent(`${prodUrl}/auth/callback`)

	const { path, query } = to
	const { code } = query || {}

	if (path === '/error') {
		next()
		return
	}
	if (path === '/auth/callback') {
		const tokenResult = await getToken({
			code,
			redirectUri,
			clientId,
			secret
		})

		const token = tokenResult?.data?.token

		if (!token) {
			window.location.replace(
				`${authUrl}?redirectUri=${redirectUri}&clientId=${clientId}&secret=${secret}`
			)
		}
		const { code: userResultCode, data: userData }: any = await getUserInfo({
			token: token
		})

		const { userName, phone } = userData

		// next('/')
		return
	}
	if (!_token) {
		window.location.replace(
			`${authUrl}?redirectUri=${redirectUri}&clientId=${clientId}&secret=${secret}`
		)
	}
	if (!_userName) {
	}
	next()
})

export default router
