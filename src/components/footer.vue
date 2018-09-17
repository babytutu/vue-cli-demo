<template>
  <footer>
    <div class="input-wrapper">
      <input class="user-msg" type="text" v-model="keywords" :placeholder="placeholder" @focus="scroll" />
      <button @click="onsend(keywords)">发送</button>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'kf-footer',
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
.input-wrapper
  height 44px
  display flex
  justify-content space-between
  border 1px solid #ccc
  .user-msg
    flex 1
</style>
