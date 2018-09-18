<template>
  <transition name="slide-fade-left">
    <div class="kf-wraper">
      <img src="~@/assets/kf.png" alt="客服头像">
      <div class="kf-wraper-content">
        <p>机器人客服</p>
        <div class="kf-wraper-content-msg content-text">
          {{text}}
          <slot></slot>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
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

