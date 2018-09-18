<template>
  <div class="home">
    <mt-header title="在线客服"></mt-header>
    <div class="content">
      <div id="content">
        <kf text="您好，我是智能客服小远，请问有什么可以帮您？" :qa="qaList">
          <ul>
            <li v-for="i in qaList" :key="i.farId" @click="askQA(i.question)">
              {{i.question}}
            </li>
          </ul>
        </kf>
        <div v-for="i in qa" :key="i.time" v-if="i.msg">
          <kf v-if="i.type === 1" :text="i.msg"></kf>
          <customer v-else :text="i.msg"></customer>
        </div>
      </div>
    </div>
    <kf-footer v-model="userMsg" placeholder="请简短描述您的问题" @onsend="onsend">
      <button @click="callKF">人工服务</button>
    </kf-footer>
  </div>
</template>
<script>
import Qs from 'qs'

import sdk from '@/plugins/socket-jssdk'

import kfFooter from '@/components/footer.vue'
import customer from '@/components/customer.vue'
import kf from '@/components/kf.vue'

export default {
  name: 'home',
  data() {
    return {
      content: '',
      userMsg: '',
      client: '',
      qa: [],
      qaList: [],
    }
  },
  components: {
    customer,
    kf,
    kfFooter
  },
  created () {
    this.getList()
    sdk.login('hehe')
  },
  mounted() {
    this.content = document.getElementById('content')
  },
  /**
   * 页面销毁前断开连接
   */
  beforeDestroy() {
    console.log('closed')
    sdk.logout()
  },
  methods: {
    callKF() {
      sdk.sendMessageBySocktIo('chatevent', 'open')
    },
    /**
     * 常见问题列表
     */
    getList() {
      this.axios.post('/questionCommon.do').then(res => {
        const msg = JSON.parse(res.msg)
        this.qaList = msg.dataList
      })
    },
    /**
     * 机器人回答问题
     */
    askQA(content) {
      this.qa.push({
        type: 2,
        msg: content,
        time: new Date().getTime()
      })
      this.axios.post('/queryRobotAnswer.do', Qs.stringify({
        content: content,
        id: '04bc81d7e84',
        userId: '04bc81d7e84',
      })).then(res => {
        const msg = JSON.parse(res.msg)
        this.qa.push({
          type: 1,
          msg: msg.result.content,
          time: new Date().getTime() + 1
        })
        this.scrollToEnd()
      }).catch(() => {
        this.scrollToEnd()
      })
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
        this.askQA(val)
      } else {
        this.$messagebox('提示', '请输入您的问题')
      }
      this.scrollToEnd()
    },
    /**
     * 滚动到底部
     */
    scrollToEnd() {
      this.$nextTick(() => {
        document.getElementById('content').scrollIntoView(false)
      })
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
