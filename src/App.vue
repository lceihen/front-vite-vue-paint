<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

fetch('../version')
	.then((response) => response.text())
	.then((data) => {
		console.log('data-----', data)
	})

onMounted(() => {})
</script>
<!-- 9-->
<template>
	<RouterView />
</template>

<style scoped></style>
