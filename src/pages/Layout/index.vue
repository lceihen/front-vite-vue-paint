<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'

const pageData = reactive({
	cursorType: true,
	toolVisible: true,
	canvasWidth: '0',
	canvasHeight: '0',
	originX: 0,
	originY: 0,
	canvasWorking: false
})

const canvasConfig = reactive({
	lineWidth: 1,
	strokeStyle: 'red'
})

const canvasRef = ref<HTMLCanvasElement | null>(null)
const canvasContext = ref<CanvasRenderingContext2D | null>(null)

onMounted(() => {
	// -8是因为border宽度是8
	pageData.canvasWidth = window.innerWidth - 16
	pageData.canvasHeight = window.innerHeight - 16
	canvasContext.value = (canvasRef.value as HTMLCanvasElement).getContext('2d')
	console.log('canvasContext----', canvasContext)
})

const utilBtnList = [
	{
		key: 'cursor'
	},
	{
		key: 'pen-setting'
	},
	{
		key: 'revert'
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
		key: 'eraser'
	},
	{
		key: 'scale'
	},
	{
		key: 'down load'
	},
	{
		key: 'unlimted area'
	}
]

const handleClickBtn = (key: string) => {
	switch (key) {
		case 'toggle cursor':
			pageData.cursorType = !pageData.cursorType
			break
		case 'clean':
			pageData.originX = 0
			pageData.originY = 0

		default:
			break
	}
}

const handleToolsVisible = () => {
	pageData.toolVisible = !pageData.toolVisible
}

const handleCanvasStartWork = (event: any) => {
	const { clientX, clientY } = event
	console.log('handleCanvasStartWork', clientX, clientY)

	const { lineWidth, strokeStyle } = canvasConfig

	canvasContext.value.lineWidth = lineWidth
	canvasContext.value.strokeStyle = strokeStyle
	// canvasContext.value.antialias = 'subpixel'
	// canvasContext.value.imageSmoothingEnabled = true
	canvasContext.value.moveTo(pageData.originX, pageData.originY)
	canvasContext.value.beginPath()
	pageData.originX = clientX
	pageData.originY = clientY + 24
	pageData.canvasWorking = true
}

const handleCanvasOverWork = (event: Event) => {
	const { offsetX, offsetY } = event
	const { canvasWorking } = pageData
	if (!canvasWorking) return
	canvasContext.value.lineTo(offsetX, offsetY + 24)
	canvasContext.value.stroke()
}

const handleCanvasFinishWork = () => {
	pageData.canvasWorking = false
	console.log('handleFinishCanvasWork')
	pageData.originX = 0
	pageData.originY = 0
}
</script>

<template>
	<div
		class="flex flex-nowrap items-center justify-center scrollbar-contain relative overflow-scroll scroll-p-0 p-0"
	>
		<body
			:class="[
				pageData.cursorType === true ? 'cursor-pen-contain' : 'cursor-grab',
				'border-8 grow overflow-scroll box-border w-screen h-screen  scrollbar-contain'
			]"
		>
			<canvas
				ref="canvasRef"
				class="box-border"
				@mousedown="handleCanvasStartWork"
				@mousemove="handleCanvasOverWork"
				@mouseout="handleCanvasFinishWork"
				@mouseup="handleCanvasFinishWork"
				@touchstart="handleCanvasStartWork"
				@touchmove="handleCanvasOverWork"
				@touchend="handleCanvasFinishWork"
				:width="pageData.canvasWidth"
				:height="pageData.canvasHeight"
			>
				<!-- @pointerout="handleCanvasFinishWork" -->
			</canvas>
		</body>
		<aside
			:class="[
				'transition-all ease-in-out duration-700 lg:h-4/5 lg:flex-col fixed lg:overflow-y-auto  w-10/12 lg:w-auto bottom-20    lg:mr-6  flex  flex-row lg:space-y-10 grow-0 bg-sky-50 p-4 cursor-default lg:right-0 box-border rounded-lg  overflow-x-scroll scrollbar-contain',
				pageData.toolVisible ? '' : '-bottom-80 lg:-bottom-full'
			]"
		>
			<button
				v-for="btnItem in utilBtnList"
				:key="btnItem.key"
				@click="() => handleClickBtn(btnItem.key)"
				class="w-32 rounded-full shrink-0 h-10 bg-sky-200 overflow-hidden lg:mr-0 cursor-default mr-6"
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
