<template>
  <div>
    <div>{{ noMore ? '没有更多信息' : '下拉可以查看历史消息'}}</div>
    <mt-loadmore :top-method="loadTop"
                 @top-status-change="handleTopChange"
                 ref="loadmore">
      <ul>
        <li v-for="item in list"
            :key="item">{{ item }}</li>
      </ul>
      <div slot="top"
           class="mint-loadmore-top">
        <span v-show="topStatus !== 'loading'" :class="{ 'rotate': topStatus === 'drop' }">↓</span>
        <span v-show="topStatus === 'loading'">加载中...</span>
      </div>
    </mt-loadmore>
  </div>
</template>
<script>
export default {
  data() {
    return {
      topStatus: '',
      list: 10,
      noMore: false,
    }
  },
  methods: {
    /**
     * 更新下拉状态
     * @param {string} status 状态
     */
    handleTopChange(status) {
      this.topStatus = status
    },
    /**
     * 下拉加载历史消息
     */
    loadTop() {
      setTimeout(() => {
        if (this.list < 20) {
          this.list += 4
        } else {
          this.noMore = true
        }
        this.$refs.loadmore.onTopLoaded()
      }, 1000)
    }
  },
}
</script>