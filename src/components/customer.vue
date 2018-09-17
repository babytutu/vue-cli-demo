<template>
  <transition name="slide-fade">
    <div class="customer-wraper">
      <div class="customer-wraper-content">
        <div class="customer-wraper-content-msg content-text">{{text}}</div>
      </div>
      <img src="~@/assets/customer.png" alt="客户头像">
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
.customer-wraper
  display flex
  justify-content: flex-end
  img
    width 30px
    height 30px
  &-content
    padding 0 10px
</style>