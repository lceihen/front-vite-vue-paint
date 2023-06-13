import Cookies from 'js-cookie'

export const handleGetParamString = (data: any = {}) => {
	const queryArray: Array<string> = []
	Object.keys(data).map((key) => {
		queryArray.push(`${key}=${encodeURIComponent(data[key])}`)
	})
	return queryArray.join('&')
}

interface IRequestProps {
	url: string
	config?: any
	data?: any
	method?: string
	headers?: any
	params?: any
}

const BaseUrl = ''

const handletransformData = (data: any, method: string, headers: any) => {
	if (method === 'GET') {
		return null
	} else if (
		method === 'POST' &&
		headers['Content-Type']?.includes('x-www-form-urlencoded')
	) {
		return handleGetParamString(data)
	} else {
		return JSON.stringify(data)
	}
}

export default (props: IRequestProps) => {
	let {
		url,
		config = {},
		data,
		method = 'GET',
		headers = {},
		params = {}
	} = props || {}

	method = method.toUpperCase()

	const paramString = handleGetParamString(params)

	url = method === 'GET' ? `${url}${paramString ? '?' + paramString : ''}` : url

	data = handletransformData(data, method, headers)
	return new Promise((resolve, reject) => {
		fetch(`${BaseUrl}${url}`, {
			headers: {
				'Content-Type': 'application/json',
				...headers
			},
			...config,
			method,
			body: data
		})
			.then((midRes) => {
				if (midRes?.redirected) {
					window.location.replace(midRes?.url)
				}
				return midRes.json()
			})
			.then((res) => {
				if (res?.code === '-1') {
					reject(res)
				}
				if (res?.code === '-10000') {
					window.location.href = '/login'
					reject(res)
				}
				resolve(res)
			})
			.catch((err) => {
				reject(err)
			})
	})
}
