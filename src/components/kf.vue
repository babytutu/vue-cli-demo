<template>
  <transition name="slide-fade-left">
    <div class="kf-wraper">
      <img src="~@/assets/kf.png" alt="客服头像">
      <div class="kf-wraper-content">
        <p>{{detail.fromNumber || '机器人客服'}}</p>
        <div v-if="detail.msg" class="kf-wraper-content-msg content-text" v-html="detail.msg">
        </div>
        <div v-if="text">{{text}}</div>
        <slot></slot>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    detail: {
      type: Object,
      default() {
        return {
          fromNumber: null,
          msg: null
        }
      }
    },
    text: String,
  }
}
</script>
<style lang="stylus" scoped>
@import '~@/assets/var.styl'
.kf-wraper
  display flex
  img
    width 30px
    height 30px
  &-content
    padding 0 10px
    p
      margin-bottom 10px
</style>

