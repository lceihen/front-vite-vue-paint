<script setup lang="ts">
console.log('1')
</script>

<template>
	<div>myapp</div>
	<div class="text-5xl font-extrabold ...">
		<span
			class="bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500"
		>
			Hello world
		</span>
	</div>
</template>

<style scoped>
.logo {
	height: 6em;
	padding: 1.5em;
	will-change: filter;
	transition: filter 300ms;
}
.logo:hover {
	filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
	filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
