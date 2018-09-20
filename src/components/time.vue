<template>
	<div class="zxtime">
		<span>{{nowTime}}</span>
	</div>
</template>

<script>
	export default {
		name: 'zxtime',
		props: {
			
		},
		data() {
			return {
				nowTime:new Date().getHours()+':'+new Date().getMinutes()
			}
		},
		methods: {
		
		},
	}
</script>

<style lang="stylus" scoped>
	.zxtime
		text-align center
		font-size 0.16rem
		color #a9b3c7
		line-height 0.5rem
</style>
