import request from '@/utils/request'

export const getToken = (params: any) => {
	return request({
		params,
		url: '/api/auth/token'
	})
}
