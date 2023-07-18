<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { isMobileDevice } from '@/utils'
import { throttle } from 'lodash'

let canvasWorking = false

let lastOriginX = null

let lastOriginY = null

let time = null

const pageData = reactive({
	cursorType: 'pen',
	toolVisible: true,
	canvasWidth: 600,
	canvasHeight: 600,
	originX: 0,
	originY: 0,
	historyViews: [],
	delHistoryViews: [],
	enlargeTimes: 1.5
})

const canvasConfig = reactive({
	lineWidth: 1,
	strokeStyle: 'red'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasContext = ref<CanvasRenderingContext2D | null>(null)
const canvasParentRef = ref<HTMLElement | null>(null)

onMounted(() => {
	// -8是因为border宽度是8

	handleInitCanvas()

	canvasContext.value = (canvasRef.value as HTMLCanvasElement).getContext('2d')
	// handleDrawCanvasTitle()

	handleSaveCurrentCanvas()

	window.addEventListener('resize', () => {
		handleResetCanvas()
		handleReloadCanvasView()
	})
})

const handleInitCanvas = () => {
	pageData.canvasWidth = 600
	pageData.canvasHeight = 600
	pageData.canvasWidth = window.innerWidth - 16 - 4
	pageData.canvasHeight = window.innerHeight - 16 - 4
}

const handleResetCanvas = () => {
	const { canvasWidth: initCanvasWidth, canvasHeight: initCanvasHeight } =
		pageData

	const width =
		initCanvasWidth > window.innerWidth - 16 - 4
			? initCanvasWidth
			: window.innerWidth - 16 - 4
	const height =
		initCanvasHeight > window.innerHeight - 16 - 4
			? initCanvasHeight
			: window.innerHeight - 16 - 4
	console.log('reset width and height', width, height)
	pageData.canvasWidth = width
	pageData.canvasHeight = height
}

const utilBtnList = [
	{
		key: 'enlarge'
	},
	{
		key: 'undo'
	},
	{
		key: 'eraser',
		description: '橡皮擦'
	},
	{
		key: 'pen',
		description: '钢笔'
	},

	{
		key: 'grab',
		description: '抓手'
	},

	{
		key: 'pen-setting'
	},

	{
		key: 'redo'
	},
	{
		key: 'clean'
	},

	{
		key: 'download'
	},
	{
		key: 'unlimted-area'
	}
]

const handleClickBtn = (key: string) => {
	let lastCursorType = pageData.cursorType
	pageData.cursorType = ''
	switch (key) {
		case 'pen':
		case 'grab':
		case 'eraser':
			pageData.cursorType = key
			break

		case 'clean':
			const currentCaptureViewData = canvasContext.value?.getImageData(
				0,
				0,
				pageData.canvasWidth,
				pageData.canvasHeight
			)
			pageData.delHistoryViews.push(currentCaptureViewData)
			pageData.originX = 0
			pageData.originY = 0
			canvasContext.value?.clearRect(
				0,
				0,
				pageData.canvasWidth,
				pageData.canvasHeight
			)
			break
		case 'undo':
			handleUndoCanvas()
			pageData.cursorType = lastCursorType
			break
		case 'redo':
			handleRedoCanvas()
			break
		case 'enlarge':
			handleEnlargeCanvas()
			// handleDrawCanvasTitle()
			break
		case 'download':
			handleCaptureCanvas()
			break
		default:
			break
	}
}
const handleCaptureCanvas = () => {
	const viewData = canvasRef.value?.toDataURL('image/png')
	const link = document.createElement('a')
	link.href = viewData
	link.download = `${new Date()}.png`
	link.click()
}

const handleEnlargeCanvas = () => {
	const { enlargeTimes } = pageData
	const { canvasWidth: initCanvasWidth, canvasHeight: initCanvasHeight } =
		pageData
	const newCanvasWidth = pageData.canvasWidth * enlargeTimes
	const newCanvasHeight = pageData.canvasHeight * enlargeTimes

	pageData.canvasWidth = newCanvasWidth
	pageData.canvasHeight = newCanvasHeight

	const offsetX = (newCanvasWidth - initCanvasWidth) / 2

	const offsetY = (newCanvasWidth - initCanvasHeight) / 2
	console.log('reset width and height', newCanvasWidth, newCanvasHeight)
	handleReloadCanvasView({
		offsetX: offsetX > 0 ? offsetX : 0,
		offsetY: offsetY > 0 ? offsetY : 0
	})
	pageData.cursorType = 'grab'
}

const handleReloadCanvasView = (resetData: any) => {
	const { offsetX = 0, offsetY = 0 } = resetData || {}

	setTimeout(() => {
		if (pageData.historyViews.length > 0) {
			const lastedViewData = pageData.historyViews.slice(-1)[0]
			canvasContext.value?.putImageData(lastedViewData, offsetX, offsetY)
		}
		if (offsetX && offsetY) {
			canvasParentRef.value?.scrollTo(offsetX, offsetY)
		}
	}, 10)
}

const handleRedoCanvas = () => {
	if (pageData.delHistoryViews.length > 0) {
		const redoViewsData = pageData.delHistoryViews.pop()
		canvasContext.value?.putImageData(redoViewsData, 0, 0)
		pageData.historyViews.push(redoViewsData)
	}
}

const handleUndoCanvas = () => {
	// 判断是否还能撤销
	if (pageData.historyViews.length > 1) {
		// 取出最后一个数据
		const lastedViewData = pageData.historyViews.pop()
		// 压入撤销队列
		pageData.delHistoryViews.push(lastedViewData)

		// 取出最后一个数据
		const currentViewData = pageData.historyViews.slice(-1)[0]
		// 重绘当前canvas
		canvasContext.value?.putImageData(currentViewData, 0, 0)
	}
}

const handleToolsVisible = () => {
	pageData.toolVisible = !pageData.toolVisible
	console.log('handleToolsVisible-----', !pageData.toolVisible)
}

const handleCanvasStartWork = (event: any, param) => {
	canvasWorking = true

	const { originX, originY } = pageData
	const { xAxis, yAxis } = handleGetPointXY(event)

	if (originX === xAxis && originY === yAxis) return
	canvasContext.value.moveTo(xAxis, yAxis)

	pageData.originX = xAxis
	pageData.originY = yAxis
}

const _throttle = (fn, ...args) => {
	if (!time) {
		time = setTimeout(() => {
			fn(...args)
			time = null
		}, 10)
	}
}

const handleCanvasMoveWork = (event: Event) => {
	if (!canvasWorking) return
	// canvasContext.value?.beginPath()
	console.log('pageData.cursorType', pageData.cursorType)
	const { xAxis, yAxis } = handleGetPointXY(event)

	if (pageData.cursorType === 'grab' && lastOriginX && lastOriginY) {
		const scrollX = xAxis - lastOriginX
		const scrollY = yAxis - lastOriginY

		console.log('scrollBy----', scrollX, scrollY, lastOriginX, lastOriginY)

		_throttle(
			() => canvasParentRef.value?.scrollBy(scrollX, scrollY),

			canvasParentRef,
			scrollX,
			scrollY
		)
	}

	// 滑动效果保留坐标
	lastOriginX = xAxis
	lastOriginY = yAxis

	// 	橡皮擦功能
	if (pageData.cursorType === 'eraser') {
		canvasContext.value.globalCompositeOperation = 'destination-out' // 设置为橡皮擦效果
		canvasContext.value.lineWidth = 10
		canvasContext.value.lineTo(xAxis, yAxis)
		canvasContext.value.stroke()
		return
	}

	if (pageData.cursorType === 'pen') {
		const { lineWidth, strokeStyle } = canvasConfig
		canvasContext.value.lineWidth = lineWidth
		canvasContext.value.strokeStyle = strokeStyle
		canvasContext.value.lineTo(xAxis, yAxis)
		canvasContext.value.stroke()
	}
}

const handleGetPointXY = (event: Event) => {
	if (isMobileDevice()) {
		if (event.offsetX) {
			const { offsetX, offsetY } = event

			return { xAxis: offsetX, yAxis: offsetY - 8 }
		} else {
			const { currentTarget, touches } = event
			const targetRect = currentTarget.getBoundingClientRect()
			const touchX = touches[0].clientX - targetRect.left
			const touchY = touches[0].clientY - targetRect.top

			return { xAxis: touchX, yAxis: touchY - 8 }
		}
	} else {
		const { offsetX, offsetY } = event
		return {
			xAxis: offsetX,
			yAxis: offsetY + 24
		}
	}
}

const handleCanvasFinishWork = (event, param) => {
	const { leaveType } = param
	pageData.delHistoryViews = []
	if (leaveType !== 'out') {
		handleSaveCurrentCanvas()
	}

	canvasWorking = false

	canvasContext.value.beginPath()
	pageData.originX = 0
	pageData.originY = 0
	lastOriginX = null
	lastOriginY = null
}

const handleSaveCurrentCanvas = () => {
	const currentCaptureViewData = canvasContext.value?.getImageData(
		0,
		0,
		pageData.canvasWidth,
		pageData.canvasHeight
	)
	pageData.historyViews.push(currentCaptureViewData)
}
</script>

<template>
	<div
		class="flex flex-nowrap items-center justify-center scrollbar-contain relative overflow-scroll scroll-p-0 p-0"
	>
		<body
			ref="canvasParentRef"
			:class="[
				`cursor-${pageData.cursorType}`,
				'border-8 grow overflow-scroll box-border w-screen h-screen  scrollbar-contain'
			]"
		>
			<canvas
				ref="canvasRef"
				class="box-border border-2 border-sky-400"
				@mousedown="(e) => handleCanvasStartWork(e)"
				@mousemove="handleCanvasMoveWork"
				@mouseout="
					(e) =>
						handleCanvasFinishWork(e, {
							leaveType: 'out'
						})
				"
				@mouseup="
					(e) =>
						handleCanvasFinishWork(e, {
							leaveType: 'up'
						})
				"
				@touchmove="handleCanvasMoveWork"
				@touchstart="handleCanvasStartWork"
				@touchend="
					(e) =>
						handleCanvasFinishWork(e, {
							leaveType: 'touchend'
						})
				"
				:width="pageData.canvasWidth"
				:height="pageData.canvasHeight"
			>
			</canvas>
			<!-- @touchstart="(e) => handleCanvasStartWork(e, { startType: 'touch' })" -->
		</body>
		<aside
			:class="[
				'transition-all ease-in-out duration-700 lg:h-4/5 lg:flex-col fixed lg:overflow-y-auto  w-10/12 lg:w-auto bottom-20    lg:mr-6  flex  flex-row lg:space-y-10 grow-0 bg-sky-50 p-4 cursor-default lg:right-0 box-border rounded-lg  overflow-x-scroll scrollbar-contain',
				pageData.toolVisible ? '' : '-bottom-40 lg:-bottom-full'
			]"
		>
			<button
				v-for="btnItem in utilBtnList"
				:key="btnItem.key"
				@click="() => handleClickBtn(btnItem.key)"
				:class="[
					'active:bg-sky-300 w-32 rounded-full shrink-0 h-10 bg-sky-200 overflow-hidden lg:mr-0 cursor-default mr-6',
					pageData.cursorType === btnItem.key ? 'bg-sky-500' : ''
				]"
			>
				{{ btnItem.key }}
			</button>
		</aside>
		<article
			@click="handleToolsVisible"
			:class="[
				' cursor-default fixed  leading-10  lg:right-10 -bottom-20  rounded-full bg-sky-200 w-32 h-32 text-center '
			]"
		>
			toggle
		</article>
	</div>
</template>

<style scoped lang="scss">
@import './index.scss';
</style>
