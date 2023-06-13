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

	const _token = Cookies.get('token')

	const { prodUrl, authUrl, clientId, secret } = authConfig
	const redirectUri = encodeURIComponent(`${prodUrl}`)

	const { path, query } = to
	const { code, userName } = query || {}

	// userName && Cookies.set('userName', userName as string)

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

		// Cookies.set('token', token)

		const { data: userData }: any = await getUserInfo({
			token: token
		})

		const { phone } = userData

		// Cookies.set('phone', phone)
		// Cookies.set('userInfo', JSON.stringify(userData))
		next('/')
		return
	}
	if (path === '/login') {
		window.location.replace(
			`${authUrl}?redirectUri=${redirectUri}&clientId=${clientId}&secret=${secret}`
		)
	}

	next()
})

export default router
