<template>
  <footer>
			<div class="input-wrapper">
				<div class="iptBox">
					<input type="text" :placeholder="placeholder" v-model="keywords" class="user-msg" @focus="scroll" @keydown.enter='onsend(keywords)'>
				</div>			
				<i class="iconfont icon-biaoqing" @click="showFace"></i>
				<i class="iconfont icon-jiahao" v-if='!keywords' @click="isPullDown"></i>
			 <mt-button type="primary" @click="onsend(keywords)" size='small' v-else='keywords'>发送</mt-button>
		</div>
		<transition enter-active-class="animated fadeInUp" leave-active-class="animated fadeOutDown">
			 <div class="pullDown" v-if='ispull'>
					<div class="sendImg">
						<i class="iconfont icon-tupian"></i>
						<span>图片</span>
					</div>
					<div class="chatKf" @click="onKF">
						<i class="iconfont icon-kefu"></i>
						<span>人工客服</span>
					</div>
					<div class="phoneKf">
						<i class="iconfont icon-dianhua"></i>
						<span>电话客服</span>
					</div>
			 </div>
		 </transition>
		 <!-- <sendImg></sendImg> -->
		 <vface v-show="faceShow" id="faceP" v-on:listenFromface="getIpccitem"></vface>
  </footer>
</template>

<script>
import sendImg from './index.vue'
import vface from './face.vue'
export default {
  name: 'kf-footer',
  props: {
    placeholder: String,
  },
  data() {
    return {
      keywords: '',
			ispull:'',
			faceShow:false
    }
  },
	components:{
		sendImg,
		vface
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
		onKF() {
			this.$emit('transManmade')
		},
    /**
     * 解决微信下虚拟键盘挡住footer,safari下还是有坑
     */
    scroll(e) {
      this.$nextTick(() => {
        e.target.scrollIntoView(true)
      })
    },
		isPullDown(){
			this.ispull=!this.ispull
			this.faceShow=false
		},
		getIpccitem(input) {
			$('.user-msg').append('<img style ="width:1.5rem;height:1.5rem;display:inline-block;" src="' + input[0] + '">')
			this.faceShow = false
			
		},
		showFace() {
			this.faceShow = !this.faceShow
			this.ispull=false
		},
  },
}
</script>

<style lang="stylus" scoped>
	
	footer
	  min-height 0.98rem
		.input-wrapper
			height 0.98rem
			display flex
			flex-direction row
			justify-content space-around
			align-items center
			background #fff			
			.iptBox
				width 5.6rem
				border-radius: 0.07rem;
				border:0.01rem solid #DBDBDB;
				height:0.64rem
				background #f8f8f8
				padding 0.1rem 0.2rem
				display flex
				.user-msg
					/* flex 1 */
					background #f8f8f8
					outline none
					flex 1
			.iconfont{
				font-size 0.6rem
			}	
		.pullDown
			height 4.25rem
			display flex
			div
				display flex
				flex-direction column
				color #b4bdcd
				font-size 0.16rem
				height 1.2rem
				width 1.2rem
				background white
				border-radius 0.07rem
				justify-content center
				align-items center
				margin 0.4rem 0.25rem
				.iconfont
					font-size 0.6rem
			
</style>
