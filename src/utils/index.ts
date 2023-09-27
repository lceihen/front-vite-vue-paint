export const isMobileDevice = () => {
	return /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
}

export const isProd = import.meta.env.MODE === 'production'
