<template>
  <div class="home">
    <mt-header title="在线客服"></mt-header>
    <div class="content">
      <div id="content">
        <div v-for="i in qa" :key="i.time" v-if="i.msg">
          <kf v-if="i.type === 1" :text="i.msg"></kf>
          <customer v-else :text="i.msg"></customer>
        </div>
      </div>
    </div>
    <kf-footer v-model="userMsg" placeholder="请简短描述您的问题" @onsend="onsend">
    </kf-footer>
  </div>
</template>
<script>
import Stomp from 'stompjs'
import kfFooter from '@/components/footer.vue'
import customer from '@/components/customer.vue'
import kf from '@/components/kf.vue'

export default {
  name: 'home',
  data() {
    return {
      wsUrl: 'ws://10.0.10.236:8080/sys/myapp/ws/092/yduczjra/websocket?CASTGC=TGT-218-9lkRelTb7qv2zbFs2q5Dzi7o4o2xYcesafmbzrc6QzeXr2MyvZ-cas01.example.org',
      content: '',
      userMsg: '',
      client: '',
      topic: '/app/subscribe',
      qa: [
        {
          type: 1,
          msg: '您好，我是智能客服小远，请问有什么可以帮您？',
          time: new Date().getTime()
        },
      ],
    }
  },
  components: {
    customer,
    kf,
    kfFooter
  },
  created () {
    this.connect()
  },
  mounted() {
    this.content = document.getElementById('content')
  },
  /**
   * 页面销毁前断开连接
   */
  beforeDestroy() {
    console.log('closed')
    this.client.disconnect()
  },
  methods: {
    /**
     * 建立stomp链接
     */
    connect() {
      this.client = Stomp.client(this.wsUrl)
      var headers = {
        // 'login': '0324',
        // 'passcode': '0324',
        // 'client-id': 'clientid'
        // additional header
      }
      this.client.connect(headers, this.onConnected, this.onFailed)
    },
    /**
     * 订阅
     */
    onConnected(frame) {
      console.log('Connected: ' + frame)
      this.client.subscribe(this.topic, this.responseCallback, this.onFailed)
    },
    /**
     * 连接失败
     */
    onFailed(frame) {
      console.log('Failed: ' + frame)
    },
    /**
     * 发送信息
     * 1、清空输入框
     * 2、增加对话（客户）
     * 3、等待ws消息返回
     * 4、增加对话（机器人）
     */
    onsend(val) {
      if (val) {
        this.userMsg = ''
        this.qa.push({
          type: 2,
          msg: val,
          time: new Date().getTime()
        })
        this.client.send(this.topic, {}, val)
        this.qa.push({
          type: 1,
          msg: '听不懂',
          time: new Date().getTime() + 1
        })
      } else {
        this.$messagebox('提示', '请输入您的问题')
      }
      this.$nextTick(() => {
        document.getElementById('content').scrollIntoView(false)
      })
    },
    /**
     * 获取响应
     */
    responseCallback (frame) {
      console.log('responseCallback msg=>' + frame.body)
    },
  },
}
</script>
<style lang="stylus" scoped>
.home
  display flex
  flex-direction column
  height 100vh
  .content
    margin 10px
    flex 1
    overflow-y scroll

</style>
