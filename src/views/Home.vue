<template>
  <div class="home">
    <mt-header title="在线客服"></mt-header>
    <div class="content">
      <div id="content">
        <kf text="您好，我是智能客服小远，请问有什么可以帮您？"
            :qa="qaList">
          <ul>
            <li v-for="i in qaList"
                :key="i.farId"
                @click="askQA(i.question)">
              {{i.question}}
            </li>
          </ul>
        </kf>
        <div v-for="i in qa"
             :key="i.time"
             v-if="i.msg">
          <kf v-if="i.type === 1"
              :detail="i"></kf>
          <customer v-if="i.type === 2"
                    :text="i.msg"></customer>
          <div v-if="i.type === 3">{{i.msg}}</div>
        </div>
      </div>
    </div>
    <kf-footer v-model="userMsg"
               placeholder="请简短描述您的问题"
               @onsend="onsend">
      <button @click="transManmade">人工服务</button>
      <button @click="disconnect">挂断</button>
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
      isRobet: true,
      recordId: '',
      userName: '',
      nickName: '',
      // socket参数
      queue: '6666300_organ1',
      deptId: '6666',
      isConnected: false, //会话是否已建立（false为未建立）
    }
  },
  components: {
    customer,
    kf,
    kfFooter
  },
  created() {
    this.getList()
    this.recordId = this.getUUID()
    this.userName = `${this.getUUID()}_${this.getUUID()}`
    this.nickName = this.getUUID()
  },
  mounted() {
    this.content = document.getElementById('content')
    window.agentTocusterMessage = (res) => {
      this.pushMSG(1, res.content, res.number)
    }
    window.agentAccpet = res => {
      console.error(res)
      this.pushMSG(1, res.content, res.agentNo)
    }
    window.oncusterToransfer = res => {
      console.error(res)
      this.pushMSG(3, res.message)
    }
  },
  /**
   * 页面销毁前断开连接
   */
  beforeDestroy() {
    console.log('closed')
    sdk.logout()
  },
  methods: {
    /**
     * 转接人工
     */
    transManmade() {
      const self = this
      this.isRobet = false
      if (!this.istransferFlag) {
        let userName = this.userName;
        let nickName = this.nickName;
        let userTel = ''
        let viplevel = ''
        let deptFlag = '1'
        let dept = self.deptId
        let userInfo = ''
        let loginType = '0'
        console.log("userName", userName)
        // this.pushMSG(2, '正在为您转接中，请稍后....')
        sdk.login(userName, nickName, userTel, viplevel, deptFlag, dept, userInfo, loginType, function (res) {
          console.info('转人工 用户登录的返回结果是：', res);
          if (res.resultCode === "0") {
            setTimeout(() => {
              sdk.connectAgentService(self.queue, "")
              this.istransferFlag = true
            }, 1000)
          } else {
            this.$messagebox({
              type: 'error',
              message: res.resultText
            })
          }
        });
      } else {
        this.pushMSG(3, '正在为您转接中，请稍后....')
      }
    },
    getUUID() { //生成唯一的UUID
      var s = [];
      var hexDigits = "0123456789abcdef";
      for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
      }
      s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
      s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
      s[8] = s[13] = s[18] = s[23] = "-";
      var uuid = s.join("");
      let index = Math.floor(Math.random() * 5 + 1)
      uuid = uuid.slice(index, 15)
      return uuid.replace(/-/g, "");
    },
    /**
     * 和客服对话
     */
    askKF(val) {
      sdk.sendTextToAgent(val)
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
      if (this.isRobet) {
        this.axios.post('/queryRobotAnswer.do', Qs.stringify({
          content: content,
          id: '04bc81d7e84',
          userId: '04bc81d7e84',
        })).then(res => {
          const msg = JSON.parse(res.msg)
          this.pushMSG(1, msg.result.content)
          this.scrollToEnd()
        }).catch(() => {
          this.scrollToEnd()
        })
      }
    },
    /**
     * 发送信息
     * 1、清空输入框
     * 2、增加对话（客户）
     * 3、等待ws消息返回
     * 4、增加对话（机器人）
     */
    onsend(val) {
      if (!val) {
        this.$messagebox('提示', '请输入您的问题')
        return
      }
      this.userMsg = ''
      this.pushMSG(2, val)
      if (this.isRobet) {
        this.askQA(val)
      } else {
        this.askKF(val)
      }
      this.scrollToEnd()
    },
    disconnect() {
      sdk.logout()
      this.pushMSG(3, '已断开链接')
    },
    /**
     * 滚动到底部
     */
    scrollToEnd() {
      this.$nextTick(() => {
        document.getElementById('content').scrollIntoView(false)
      })
    },
    /**
     * 更新对话列表
     * @param {string|number} type 类型
     * @param {string} msg 信息
     * @param {string|number} fromNumber 座机号
     */
    pushMSG(type, msg, fromNumber = null) {
      console.log(type, msg, fromNumber)
      this.qa.push({
        type,
        msg,
        time: new Date().getTime() + 1,
        fromNumber
      })
    }
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