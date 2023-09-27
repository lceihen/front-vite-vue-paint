<script setup lang="ts">
import { throttle } from 'lodash'
import { reactive, ref, onMounted } from 'vue'
import { isMobileDevice, isProd } from '@/utils'

// canvas是否处于pen工作
let canvasWorking = false

// 这里应该可以优化
let lastOriginX = null
let lastOriginY = null

let isSave = true

let lastedViewDataForRect = null

// 实时坐标
let position = []
// 放大的次数
let enlargeTimes = 1

const pageData = reactive({
	cursorType: 'pen',
	toolVisible: true,
	canvasWidth: 600,
	canvasHeight: 600,
	originX: 0,
	originY: 0,
	historyViews: [],
	delHistoryViews: [],
	setting: {
		pen: {
			width: 4,
			color: '#000'
		},
		eraser: {
			width: 10
		},
		currentType: 'pen',
		body: {}
	},

	// 放大的距离
	enlargeDistance: 50
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasContext = ref<CanvasRenderingContext2D | null>(null)
const canvasParentRef = ref<HTMLElement | null>(null)

onMounted(() => {
	// -8是因为border宽度是8

	handleInitCanvas()

	canvasContext.value = (canvasRef.value as HTMLCanvasElement).getContext('2d')

	document.addEventListener(
		'dragover',
		(event) => event.preventDefault(),
		false
	)

	window.addEventListener('resize', () => {
		handleBootstrapCanvas()
		handleReloadCanvasView()
	})

	setInterval(handleSaveDataToLocastorage, 15000)
})

const handleInitCanvas = () => {
	const initData = JSON.parse(localStorage.getItem('canvas'))

	if (initData) {
		for (let p in initData) {
			if (p === 'historyViews') continue
			if (p === 'setting' && initData.setting.body.backgroundColor) {
				canvasRef.value.style.backgroundColor =
					initData.setting.body.backgroundColor
			}
			pageData[p] = initData[p]
		}

		const image = new Image()
		image.onload = () => {
			canvasContext.value?.drawImage(image, 0, 0)
		}
		console.log('pageData------', pageData)
		image.src = initData.historyViews[0]
	} else {
		pageData.canvasWidth = window.innerWidth - 16 - 4
		pageData.canvasHeight = window.innerHeight - 16 - 4
	}

	setTimeout(() => {
		handleSaveCurrentCanvas()
	}, 50)
}

const handleBootstrapCanvas = () => {
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
		key: 'rect'
	},
	{
		key: 'reset'
	},

	{
		key: 'download'
	},
	{
		key: 'loadFile'
	},
	{
		key: 'pen',
		description: '钢笔'
	},
	{
		key: 'eraser',
		description: '橡皮擦'
	},
	{
		key: 'undo'
	},
	{
		key: 'redo'
	},

	{
		key: 'grab',
		description: '抓手'
	},

	{
		key: 'setting'
	},

	{
		key: 'enlarge'
	},
	{
		key: 'save'
	},
	{
		key: 'autoView'
	}
]

const handleClickBtn = (key: string) => {
	let lastCursorType = pageData.cursorType
	if (lastCursorType === 'setting' && key !== 'setting') {
		// 退出设置

		pageData.cursorType = pageData.setting.currentType
		return
	}

	switch (key) {
		case 'pen':
		case 'grab':
		case 'eraser':
			pageData.cursorType = key
			break
		case 'undo':
			handleUndoCanvas()
			pageData.cursorType = lastCursorType
			break
		case 'redo':
			handleRedoCanvas()
			pageData.cursorType = lastCursorType
			break
		case 'enlarge':
			handleEnlargeCanvas()
			pageData.cursorType = 'grab'

			break
		case 'download':
			isSave = false
			handleCaptureCanvas()
			isSave = true
			break
		case 'reset':
			handleResetCanvas()
			pageData.cursorType = lastCursorType
			break
		case 'setting':
			pageData.cursorType = 'setting'
			break
		case 'rect':
			pageData.cursorType = 'rect'
			break
		case 'save':
			handleSaveDataToLocastorage()
			break
		case 'autoView':
			handleAutoView()
			break
		default:
			break
	}
}

const handleResetCanvas = () => {
	handleClickBtn('clean')
	pageData.originX = 0
	pageData.originY = 0
	canvasContext.value?.clearRect(
		0,
		0,
		pageData.canvasWidth,
		pageData.canvasHeight
	)
	localStorage.clear()
	handleInitCanvas()
}

const handleAutoView = () => {
	canvasContext.value.clearRect(
		0,
		0,
		pageData.canvasWidth,
		pageData.canvasHeight
	)
	pageData.historyViews.forEach((view, index) => {
		setTimeout(() => {
			canvasContext.value?.putImageData(view, 0, 0)
		}, 500 * index)
	})
}

const handleCaptureCanvas = () => {
	const lastedViewData = canvasContext.value?.getImageData(
		0,
		0,
		pageData.canvasWidth,
		pageData.canvasHeight
	)

	canvasContext.value.globalCompositeOperation = 'destination-over'
	canvasContext.value.fillStyle =
		pageData.setting.body.backgroundColor || '#FFFFFF'
	canvasContext.value.fillRect(
		0,
		0,
		pageData.canvasWidth,
		pageData.canvasHeight
	)

	const viewData = canvasRef.value?.toDataURL('image/png')
	canvasContext.value.globalCompositeOperation = 'source-over'

	const link = document.createElement('a')
	link.href = viewData
	link.download = `${new Date()}.png`
	link.click()
	canvasContext.value?.putImageData(lastedViewData, 0, 0)
}

const handleEnlargeCanvas = () => {
	const { enlargeDistance } = pageData

	const newCanvasWidth = pageData.canvasWidth + enlargeDistance
	const newCanvasHeight = pageData.canvasHeight + enlargeDistance

	const offsetX = (enlargeTimes * enlargeDistance) / 2

	const offsetY = (enlargeTimes * enlargeDistance) / 2

	pageData.canvasWidth = newCanvasWidth
	pageData.canvasHeight = newCanvasHeight
	enlargeTimes = enlargeTimes + 1

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
			try {
				canvasContext.value?.putImageData(lastedViewData, offsetX, offsetY)
			} catch (error) {
				console.log('error----', lastedViewData, error)
			}
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

const handleChangeValue = (event, key) => {
	pageData.setting[pageData.setting.currentType][key] = event.target.value
	if (pageData.setting.currentType === 'body' && key === 'backgroundColor') {
		canvasRef.value.style.backgroundColor = event.target.value
	}
}

const handleCanvasStartWork = (event: any) => {
	if (pageData.cursorType === 'rect') {
		isSave = false
		console.log('pageData.historyViews------', pageData)
		lastedViewDataForRect = pageData.historyViews.slice(-1)[0]
	}

	// 退出设置
	if (pageData.cursorType === 'setting') {
		pageData.cursorType = pageData.setting.currentType
		return
	}

	canvasWorking = true

	const { originX, originY } = pageData
	const { xAxis, yAxis } = handleGetPointXY(event)

	if (originX === xAxis && originY === yAxis) return
	canvasContext.value.moveTo(xAxis, yAxis)

	position = []
	pageData.originX = xAxis
	pageData.originY = yAxis
}

const handleCanvasMoveWork = (event: Event) => {
	if (!canvasWorking) return

	const { originX, originY } = pageData

	const { xAxis, yAxis } = handleGetPointXY(event)

	// 	橡皮擦功能
	if (pageData.cursorType === 'eraser') {
		canvasContext.value.lineWidth = pageData.setting.eraser.width
		canvasContext.value.strokeStyle =
			pageData.setting.body.backgroundColor || '#ffffff'
		canvasContext.value.lineCap = 'round'
		canvasContext.value.lineTo(xAxis, yAxis)

		canvasContext.value.stroke()

		return
	}

	if (pageData.cursorType === 'pen') {
		handleCanvasMovePenWork(event)
	}

	if (pageData.cursorType === 'grab' && lastOriginX && lastOriginY) {
		const scrollX = xAxis - lastOriginX
		const scrollY = yAxis - lastOriginY
		canvasParentRef.value?.scrollBy(-scrollX, -scrollY)
	}

	if (pageData.cursorType === 'rect') {
		console.log('lastedViewDataForRect----', lastedViewDataForRect)
		if (lastedViewDataForRect)
			canvasContext.value?.putImageData(lastedViewDataForRect, 0, 0)

		const startPointX = originX > xAxis ? xAxis : originX
		const startPointY = originY > yAxis ? yAxis : originY
		const rectWidth = Math.abs(originX - xAxis)
		const rectHeight = Math.abs(originY - yAxis)
		canvasContext.value.strokeStyle = pageData.setting.pen.color
		canvasContext.value?.strokeRect(
			startPointX,
			startPointY,
			rectWidth,
			rectHeight
		)
	}

	// 滑动效果保留坐标,grab专用
	lastOriginX = xAxis
	lastOriginY = yAxis
}

const handleCanvasMovePenWork = throttle((event) => {
	console.log('handleCanvasMovePenWork')
	const { xAxis, yAxis } = handleGetPointXY(event)
	const { width: lineWidth, color: strokeStyle } = pageData.setting.pen
	canvasContext.value.lineWidth = lineWidth
	console.log('lineWidth', lineWidth)
	canvasContext.value.lineCap = 'round'

	canvasContext.value.strokeStyle = strokeStyle
	position.push({
		x: xAxis,
		y: yAxis
	})
	if (position.length === 4) {
		const { x: beginX, y: beginY } = position[0]
		const { x: startX, y: startY } = position[1]
		const { x: centerX, y: centerY } = position[2]
		const { x: lastX, y: lastY } = position[3]
		canvasContext.value?.moveTo(beginX, beginY)
		canvasContext.value?.bezierCurveTo(
			startX,
			startY,
			centerX,
			centerY,
			lastX,
			lastY
		)
		position = position.slice(-1)
		canvasContext.value?.moveTo(centerX, centerY)
	}

	canvasContext.value.stroke()
}, 10)

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
		let { offsetX, offsetY } = event

		if (['pen'].includes(pageData.cursorType)) {
			offsetY = offsetY + 24
		}
		if (['eraser'].includes(pageData.cursorType)) {
			offsetY = offsetY + 18
		}

		return {
			xAxis: offsetX,
			yAxis: offsetY
		}
	}
}

const handleCanvasFinishWork = (event, param) => {
	isSave = true
	const { leaveType } = param

	if (leaveType !== 'out') {
		handleSaveCurrentCanvas()
	}

	canvasWorking = false
	canvasContext.value.beginPath()
	pageData.originX = 0
	pageData.originY = 0
	lastOriginX = null
	lastOriginY = null
	lastedViewDataForRect = null
}

const handleLoadFile = (event) => {
	event.preventDefault()

	const file = event.target?.files?.[0] || event.dataTransfer.files[0]

	if (!file) return
	pageData.delHistoryViews = []
	pageData.historyViews = []
	const image = new Image()
	const reader = new FileReader()

	reader.onload = function (event) {
		image.src = event.target.result
	}

	reader.readAsDataURL(file)
	image.onload = () => {
		console.log('file load', image.width, image.height)
		const imageWidth = image.width
		const imageHeight = image.height

		let offsetX =
			pageData.canvasWidth > imageWidth
				? (pageData.canvasWidth - imageWidth) / 2
				: 0
		let offsetY =
			pageData.canvasHeight > imageHeight
				? (pageData.canvasHeight - imageHeight) / 2
				: 0

		canvasContext.value.clearRect(
			0,
			0,
			pageData.canvasWidth,
			pageData.canvasHeight
		)

		if (
			imageWidth < pageData.canvasWidth &&
			imageHeight < pageData.canvasHeight
		) {
			canvasContext.value?.drawImage(image, offsetX, offsetY)
		} else {
			canvasContext.value?.drawImage(
				image,
				0,
				0,
				imageWidth,
				imageHeight,
				0,
				0,
				pageData.canvasWidth,
				pageData.canvasHeight
			)
		}
		handleSaveCurrentCanvas()
	}
}

const handleSetCurrentSetting = (event) => {
	pageData.setting.currentType = event.target.value
}

const handleSaveDataToLocastorage = () => {
	if (!isSave) return

	if (isProd) {
		console.log(`saveing at ${new Date()}`)
	}

	const storageData = {
		...pageData,
		delHistoryViews: [],
		historyViews: [canvasRef.value?.toDataURL()]
	}
	localStorage.setItem('canvas', JSON.stringify(storageData))
}

// 初始化回退的第一个数据
const handleSaveCurrentCanvas = () => {
	const currentCaptureViewData = canvasContext.value?.getImageData(
		0,
		0,
		pageData.canvasWidth,
		pageData.canvasHeight
	)
	console.log('handleSaveCurrentCanvas-----', currentCaptureViewData)
	if (currentCaptureViewData === undefined || !currentCaptureViewData) return

	if (pageData.historyViews.length > 10) {
		pageData.historyViews = [
			...pageData.historyViews.slice(0, 10),
			currentCaptureViewData
		]
	} else {
		pageData.historyViews.push(currentCaptureViewData)
	}
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
				'border-8 grow overflow-scroll box-border w-screen h-screen  scrollbar-contain',
				// 禁止浏览器自身的行为
				['pen', 'eraser', 'rect'].includes(pageData.cursorType)
					? 'touch-none'
					: '',
				pageData.cursorType === 'grab' ? 'cursor-grab' : ''
			]"
			id="canvasParentRef"
		>
			<canvas
				ref="canvasRef"
				class="box-border border-2 border-sky-400"
				@drop="handleLoadFile"
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
				:class="[
					'active:bg-sky-300 w-32 rounded-full shrink-0 h-10 bg-sky-200 overflow-hidden lg:mr-0 cursor-default mr-6',
					pageData.cursorType === btnItem.key ? 'bg-sky-500' : ''
				]"
			>
				<article v-if="btnItem.key === 'loadFile'">
					<label for="file">loadFile</label>
					<input
						type="file"
						id="file"
						class="hidden"
						:onchange="handleLoadFile"
						accept="image/*"
					/>
				</article>
				<div v-else>{{ btnItem.key }}</div>
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
		<!-- 弹框设置 -->
		<article
			class="space-y-2 p-3 fixed border-sky-300 w-2/5 h-64 border-2 flex flex-col opacity-100 bg-white"
			v-show="pageData.cursorType === 'setting'"
		>
			<article class="flex">
				<span
					class="flex text-sky-500 w-1/2 items-center text-center justify-center"
					>Setting</span
				>
				<select
					:onchange="handleSetCurrentSetting"
					:value="pageData.setting.currentType"
					id="selectBox"
					class="block w-1/2 px-4 py-2 mr-2 border rounded-md focus:outline-none focus:border-blue-300"
				>
					<option value="pen">pen</option>
					<option value="eraser">eraser</option>
					<option value="body">body</option>
					<option value="readme">readme</option>
				</select>
			</article>
			<article
				class="flex justify-evenly items-center"
				v-if="['pen', 'eraser'].includes(pageData.setting.currentType)"
			>
				<span class="w-1/2 text-center"
					>{{ pageData.setting.currentType }} width</span
				>
				<div class="flex w-1/2 justify-evenly items-center">
					<input
						type="range"
						id="volume"
						name="volume"
						min="1"
						max="20"
						:value="pageData.setting[pageData.setting.currentType].width"
						:onchange="(event) => handleChangeValue(event, 'width')"
					/>
				</div>
			</article>
			<article
				class="flex justify-evenly items-center"
				v-show="pageData.setting.currentType === 'pen'"
			>
				<span class="w-1/2 text-center">pen color</span>
				<div class="flex justify-evenly items-center w-1/2">
					<input
						type="color"
						:value="pageData.setting.pen.color"
						:onchange="(event) => handleChangeValue(event, 'color')"
					/>
				</div>
			</article>
			<article
				class="flex justify-evenly items-center"
				v-show="pageData.setting.currentType === 'body'"
			>
				<span class="w-1/2 text-center">body color</span>
				<div class="flex justify-evenly items-center w-1/2">
					<input
						type="color"
						:value="pageData.setting.body.backgroundColor || '#fff'"
						:onchange="(event) => handleChangeValue(event, 'backgroundColor')"
					/>
				</div>
			</article>
			<article v-show="pageData.setting.currentType === 'readme'">
				1、pen可以调整颜色和大小<br />
				2、eraser可以调整大小<br />
				3、可以改变背景颜色<br />
				4、可以直接拖拽或者loadfile加载图片<br />
				5、大小图片自动缩放放置<br />
			</article>
		</article>
	</div>
</template>

<style scoped lang="scss">
@import './index.scss';
</style>
