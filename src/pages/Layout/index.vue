<script setup lang="ts">
import { onMounted } from 'vue'
import { getUserList } from '@/api'
onMounted(async () => {
	await getUserList({
		pageSize: 10,
		current: 1
	})
})
</script>

<template>
	<div>125</div>
</template>

<style scoped lang="scss">
@import './index.scss';
</style>
