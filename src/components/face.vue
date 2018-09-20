<template>
	<div class='face' id="face">
		<ul>
			<!-- <li v-for="(item,index) in items" @click='sendData(item)'>
				<img :src="require(item)"/>
				
			</li> -->
			<li v-for="item in 105" @click='sendData(item)'>
				<!-- <img :src="require(item)"/> -->
				<img :src="require('@/assets/img/face/' + item + '.gif')">
			</li>
		</ul>
	</div>
</template>
<script>
	export default {
		data() {
			return {
				items: [],
				ipccItems: [],
		
			}
		},
		methods: {
			getItems() {
				
				for (let i = 1; i <= 105; i++) {
					/* this.items.push('@/assets/img/face/' + i + '.gif') */
					this.items.push('@/assets/img/face/' + i + '.gif')
				}
			},
			sendData(item) {
				this.ipccItems = []
				this.ipccItems.push(item)
				this.$emit('listenFromface', this.ipccItems)
			}
		},
		created() {
			this.getItems()
		}
	}
</script>
<style scoped>
	.face {
		/* width: 420px; */
		/* height: 195px; */
		border-top: 0.01rem solid #ccc;
		/* border-left: 0.01rem solid #ccc; */
		/* border-radius: 0.04rem; */
	}

	.face li {
		float: left;
		width: 25px;
		/* height: 28px; */
		padding: 2px;
		box-sizing: border-box;
		border-right: 1px solid #ccc;
		border-bottom: 1px solid #ccc;
		cursor: pointer;
	}

	#face img {
		vertical-align: top;
	}
</style>
