<template>
	<header>
		<mt-header title="在线客服">
			<router-link to="/" slot="left">
				<mt-button icon="back"></mt-button>
			</router-link>
		</mt-header>
	</header>
</template>

<script>
	export default {
		name: 'kf-header',
		props: {
			placeholder: String,
		},
		data() {
			return {
				keywords: ''
			}
		},
		methods: {
			/**
			 * 点击发送触发，传值后清空
			 * @param {string} val 用户输入对值
			 */
			onsend(val) {
				this.$emit('onsend', val)
				this.keywords = ''
			},
			/**
			 * 解决微信下虚拟键盘挡住footer,safari下还是有坑
			 */
			scroll(e) {
				this.$nextTick(() => {
					e.target.scrollIntoView(true)
				})
			}
		},
	}
</script>

<style lang="stylus" scoped>
	header {
		height: 0.9rem
	}

	.mint-header {
		background: #fff;
		color: #000000;
		/* font-size:0.32rem */
	}

	.mint-header .mint-header-title {
		height: 100px
	}
</style>
