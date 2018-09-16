<template>
  <div class="about">
    <h1>{{detail.title}}</h1>
    <div v-html="detail.content"></div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      detail: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.axios.get('https://interface.meiriyiwen.com/article/day?dev=1&date=20180911').then(res => {
        this.detail = res.data.data
      })
    }
  },
}
</script>

