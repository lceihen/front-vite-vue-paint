import request from '@/utils/request'

export const getUserInfo = (params: any) => {
	return request({
		params,
		url: '/api/user'
	})
}
export const getUserList = (params: any) => {
	return request({
		params,
		url: '/api/user/getUserList'
	})
}
