<template>
  <div class="about">
    <h1>{{detail}}</h1>
    <p>{{socket.id}}</p>
  </div>
</template>
<script>
import io from 'socket.io-client'

export default {
  data() {
    return {
      detail: {},
      socket: ''
    }
  },
  created() {
    this.socket = io('http://localhost:8000')
    this.socket.on('this', (data) => {
      this.detail = data.will
      this.socket.emit('private message', 'hehe', 'hello')
    })
  },
}
</script>
<style scoped>
.about{
  font-size: 24px
}
</style>
