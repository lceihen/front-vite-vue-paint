export const isMobileDevice = () => {
	return /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent)
}
