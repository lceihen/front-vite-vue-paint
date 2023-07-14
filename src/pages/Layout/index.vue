<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { isMobileDevice } from '@/utils'

const pageData = reactive({
	cursorType: true,
	toolVisible: true,
	canvasWidth: 600,
	canvasHeight: 600,
	originX: 0,
	originY: 0,
	canvasWorking: false,
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
const canvasContainRef = ref<HTMLElement | null>(null)

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

	pageData.canvasWidth = width
	pageData.canvasHeight = height
}

const utilBtnList = [
	{
		key: 'cursor'
	},
	{
		key: 'pen-setting'
	},
	{
		key: 'undo'
	},
	{
		key: 'eraser'
	},

	{
		key: 'enlarge'
	},
	{
		key: 'redo'
	},
	{
		key: 'clean'
	},
	{
		key: 'pen'
	},
	{
		key: 'hand'
	},

	{
		key: 'download'
	},
	{
		key: 'unlimted-area'
	}
]

const handleClickBtn = (key: string) => {
	switch (key) {
		case 'cursor':
			pageData.cursorType = !pageData.cursorType
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

	handleReloadCanvasView({
		offsetX: offsetX > 0 ? offsetX : 0,
		offsetY: offsetY > 0 ? offsetY : 0
	})
}

const handleReloadCanvasView = (resetData: any) => {
	const { offsetX = 0, offsetY = 0 } = resetData

	setTimeout(() => {
		if (pageData.historyViews.length > 0) {
			const lastedViewData = pageData.historyViews.slice(-1)[0]
			canvasContext.value?.putImageData(lastedViewData, offsetX, offsetY)
		}
		if (offsetX && offsetY) {
			canvasContainRef.value?.scrollTo(offsetX, offsetY)
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
}

const handleCanvasStartWork = (event: any) => {
	const { originX, originY } = pageData
	const { xAxis, yAxis } = handleGetPointXY(event)
	if (originX === xAxis && originY === yAxis) return

	const { lineWidth, strokeStyle } = canvasConfig

	canvasContext.value.lineWidth = lineWidth
	canvasContext.value.strokeStyle = strokeStyle

	canvasContext.value.moveTo(originX, originY)
	canvasContext.value.beginPath()
	pageData.originX = xAxis
	pageData.originY = yAxis
	pageData.canvasWorking = true
}

const handleCanvasOverWork = (event: Event) => {
	const { xAxis, yAxis } = handleGetPointXY(event)
	const { canvasWorking } = pageData
	if (!canvasWorking) return
	canvasContext.value.lineTo(xAxis, yAxis)
	canvasContext.value.stroke()
}

const handleGetPointXY = (event: Event) => {
	if (isMobileDevice()) {
		const { clientX, clientY } = event.targetTouches[0]
		return { xAxis: clientX, yAxis: clientY - 8 }
	} else {
		const { offsetX, offsetY } = event
		return {
			xAxis: offsetX,
			yAxis: offsetY + 24
		}
	}
}

const handleCanvasFinishWork = (param) => {
	const { leaveType } = param
	pageData.delHistoryViews = []
	if (leaveType !== 'out') {
		handleSaveCurrentCanvas()
	}

	pageData.canvasWorking = false
	console.log('handleFinishCanvasWork')
	pageData.originX = 0
	pageData.originY = 0
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
			ref="canvasContainRef"
			:class="[
				pageData.cursorType ? 'cursor-pen-contain' : 'cursor-grab',
				'border-8 grow overflow-scroll box-border w-screen h-screen  scrollbar-contain'
			]"
		>
			<canvas
				ref="canvasRef"
				class="box-border border-2 border-sky-400"
				@mousedown="handleCanvasStartWork"
				@mousemove="handleCanvasOverWork"
				@mouseout="
					() =>
						handleCanvasFinishWork({
							leaveType: 'out'
						})
				"
				@mouseup="
					() =>
						handleCanvasFinishWork({
							leaveType: 'up'
						})
				"
				@touchstart="handleCanvasStartWork"
				@touchmove="handleCanvasOverWork"
				@touchend="
					() =>
						handleCanvasFinishWork({
							leaveType: 'touchend'
						})
				"
				:width="pageData.canvasWidth"
				:height="pageData.canvasHeight"
			>
			</canvas>
		</body>
		<aside
			:class="[
				'transition-all ease-in-out duration-700 lg:h-4/5 lg:flex-col fixed lg:overflow-y-auto  w-10/12 lg:w-auto bottom-20    lg:mr-6  flex  flex-row lg:space-y-10 grow-0 bg-sky-50 p-4 cursor-default lg:right-0 box-border rounded-lg  overflow-x-scroll scrollbar-contain',
				pageData.toolVisible ? '' : '-bottom-60 lg:-bottom-full'
			]"
		>
			<button
				v-for="btnItem in utilBtnList"
				:key="btnItem.key"
				@click="() => handleClickBtn(btnItem.key)"
				class="active:bg-sky-300 w-32 rounded-full shrink-0 h-10 bg-sky-200 overflow-hidden lg:mr-0 cursor-default mr-6"
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
