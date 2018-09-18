/* eslint-disable */
import io from 'socket.io-client'
/**
 * 整理下原有代码，搬迁加优化，逻辑不动
 */
const disconnection = 0
const socketio_connectEvent = "connect"
const socketio_disconnectEvent = "disconnect"
// const socketio_errorEvent = "error"
const socketio_messageEvent = "chatevent"

let socket_io_url = ""
let webchat_login = ''
let webchat_sendFile = ''
let webchat_satis = ''
let webchat_getDetails = ''

let siConn_main = null // 建立socket.io链接

// 客户的唯一标识
let s_userName = ""

let sip_userName = ""
// 客户的昵称
let s_name = ""
let s_userTel = ""
// 客户优先级等级
let s_vipLevel = ""
// 客户优先级等级
let s_displayVipLevel = ""
// 客户选择的队列
let s_queue = ""
// 技能
let s_remarks = ""
// 客户选择的技能
let s_skill = ""
let s_curfromNumberName = "" // s_name+'|'+s_userTel
// 转人工后生成jobId
let s_jobId = ""
//
let s_toNumber = ""
// 客户的电话号码
let s_phoneNumber = ""

let webSocketConnected = false

let s_host = ""

let s_isDeptId = ""

let s_deptId = ""

let manualDisConnect = false
let webchat_satisfy_control = ''
//sockt.io连接
let resumable = false

let isProxy = false
let ipAndPort = ''
/**
 * ===============================客户端发送接口 socktio连接=================================
 */
/**
 * 登录接口 return resultCode 0 success, -1 error
 */
function login(userName, nickName, userTel, vipLevel, deptFlag, dept, cus_info, loginType, callback) {
  console.log("客户侧用户登录:" + userName)
  // 登陆方式
  var random = "web" + Math.round(Math.random() * 1000000) // 生成客户号码
  s_userName = random + userName + '-' + dept
  s_isDeptId = deptFlag
  s_deptId = dept
  s_userTel = userTel
  s_name = nickName
  s_vipLevel = vipLevel
  s_remarks = new customerinfojson('1', "2", "3", "5", cus_info, loginType)
  s_curfromNumberName = s_name + '|' + s_userTel

  // 设置代理
  setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId)
  var _param = "?userName=" + s_userName + "&name=" + s_name + "&userId=" + s_userName + "&userTel=" + s_userTel + "&vipLevel=" + s_vipLevel +
    "&queue=null" + "&skill=null" + "&remarks=" + s_remarks + "&resumable=false"
  var url = webchat_login + _param
  console.log("url===" + url)
  doJsonGet(url, function (obj) {
    if (obj.resultCode == "0") {
      console.log("登录成功")
      callback(obj)
      siconnection(s_userName, obj.resumable)
    } else if (obj.resultCode == "-1") {
      console.log("登录出错" + obj)
      window.location.reload()
    }
  })
}

//socktio登出
function logout() {
  if (siConn_main != null) {
    var closeData = JSON.stringify({ userName: s_userName })
    console.log("用户登出时关闭socket.io通道:" + closeData)
    sendMessageBySocktIo(siConn_main, "Webbot_close", closeData)
    sendMessageBySocktIo(siConn_main, "Websocket_close", closeData)
    manualDisConnect = true
    siConn_main.disconnect()
    siConn_main = null
  }
}

/**
 * 获取代理 domain
 */
function setProxyUrlSocktIO(isproxy, host, isdeptid, dept) { // department id/name
  console.log("获取代理 domain")
  let _host = ""
  let departments
  if (isdeptid == "1") {
    departments = 'deptid/' + dept
  } else if (isdeptid == "2") {
    departments = 'deptname/' + dept
  }
  //	_host = (isproxy && dept != '') ? (host + '/uipcc/'+departments) : (host)
  _host = host
  // http://[domain]/uipcc/deptid/[deptid]/ucagent/portal_proxy.jsp?deptId=101&name=1000&isProxyWithDeptId=true
  socket_io_url = 'http://' + host.split(":")[0] + ":9909"

  webchat_login = 'http://' + _host + '/ucWebchat2CustomerServer/servlet/webchat_service/login'
  webchat_sendFile = 'http://' + _host + '/ucWebchat2CustomerServer/servlet/upload'
  webchat_satis = 'http://' + _host + '/ucWebchat2CustomerServer/servlet/satisfaction'
  webchat_getDetails = 'http://' + _host + '/ucWebchat2CustomerServer/servlet/history'
  return _host
}

/**
 * socktio发送消息
 * @param {*} socket socket
 * @param {string} type 消息类型
 * @param {string} message 消息内容
 */
function sendMessageBySocktIo(socket, type, message) {
  console.log("通过socket.io通道发送消息:" + message)
  socket.emit(socketio_messageEvent, {
    message,
    type
  })
}

/**
 * 转人工接口
 * @param {string} serviceType 服务类型 即所选择的队列ID
 * @param {string} skillType 服务技能
 * @returns
 */
function connectAgentService(serviceType, skillType) {
  s_queue = "sip:" + serviceType + "@acd.u3c.com"
  var curfromNumberName = s_curfromNumberName
  var postData = JSON.stringify({
    type: "open",
    fromNumber: sip_userName,
    queueUri: s_queue,
    deptId: s_deptId,
    skill: skillType,
    userName: curfromNumberName,
    remarks: s_remarks,
    vipLevel: s_vipLevel,
    displayVipLevel: s_displayVipLevel
  })
  sendMessageBySocktIo(siConn_main, "ClientSend_request", postData)
}


function siconnection(userName, p_resumable) {
  console.log("用户:" + userName + "的socket.io连接开始")
  s_userName = userName
  sip_userName = "sip:" + s_userName + "@u3c.com"
  var url = socket_io_url
  console.log("socket.io服务器连接地址:" + url)
  var options = { 'reconnect': false, 'auto connect': false, "force new connection": true }
  siConn_main = io.connect(url, options)
  ws_state = siConn_main.io.readyState
  if (true == p_resumable || "true" == p_resumable) {
    resumable = true
  } else {
    resumable = false
  }
  siConn_main.on(socketio_connectEvent, function () {
    console.log("socket.io连接成功,并将用户名存入缓存")
    var json = JSON.stringify({ userName: s_userName, resumable: resumable })
    //打开连接时将客户会话存在缓存中
    sendMessageBySocktIo(siConn_main, "Websocket_open", json)
    //heartBeat.start()
    setWebSocketConnected()
    reconnect.clear() // 清除重连定时器
  })
  siConn_main.on(socketio_disconnectEvent, function () {
    console.log("socket.io连接已断开=====")

    if (siConn_main != null && !manualDisConnect) {
      console.log("重新连接")
      reconnect.start() // 重连
      disconnection = 1
      onDisConnectionEvent(disconnection)
    }
  })
  /*	siConn_main.on(socketio_errorEvent,function(){
  		console.log("socket.io连接错误,稍后再试")
  		ws_state = siConn_main.io.readyState
  		use_ws=false
  		console.log("socket.io重新连接")
  		siConn_main.disconnect()
  		reconnect.start()
  		//siConn_main.reconnect()// 重连
  		disconnection = 1
  		onDisConnectionEvent(disconnection)
  	})*/


  siConn_main.on(socketio_messageEvent, function (json) {
    //		heartBeat.reset()// 更新心跳
    // var data = eval('(' + json + ')')
    const data = JSON.parse(json)
    console.log("服务端响应处理")
    if ("heartbeat" == data.eventKey) {
      if (data.resultCode == 0) {
        disconnection = 2
      } else {
        logout()
      }
    } else if ("searchAnswer" == data.eventKey) {
      onRobbotAnswer(data.resultCode, data.resultText, data.msgId, data.remark)
    } else if ("clientSendReply" == data.eventKey) {
      console.log("clientSendReply---" + data)
      if ("toAgent" == data.type) { // 请求转人工 的返回
        s_jobId = data.resultPath.jobId
        modifyWebchatSatisfyControl(data.satisfyControl)
        onAgentServiceBack(data.resultCode, data.resultText)
      } else if ("sendText" == data.type) { // 发送文本消息
        onSendTextBack(data.resultCode, data.resultText, data.msgId, data.remark)
      } else if ("sendFile" == data.type) { // 发送文件
        var _fileUrl = data.fileUrl
        if (isProxy) {
          var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId)
          _hostname = _hostname.split(":")[0] + ":8080"
          _fileUrl = _fileUrl.replace(_fileUrl.substring(0, _fileUrl.indexOf('/recorderfileserver')), _hostname)
        }
        onSendFileBack(data.resultCode, data.resultText, _fileUrl, data.msgId, data.subFileType)
      } else if ("sendPic" == data.type) { // 发送图片消息
        var _begin = data.resultPath.begin
        var _end = data.resultPath.end
        if (isProxy) {
          var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId)
          _hostname = _hostname.split(":")[0] + ":8080"
          _begin = 'http://' + _begin.replace(_begin.substring(0, _begin.indexOf('/recorderfileserver')), _hostname)
          _end = 'http://' + _end.replace(_end.substring(0, _end.indexOf('/recorderfileserver')), _hostname)
        }
        var fileUrl = [_begin, _end]
        onSendPicBack(data.resultCode, data.resultText, fileUrl, data.msgId)
      } else if ("sendRemote" == data.type) { // 请求远程的返回
        onSendRemote(data.resultCode, data.resultText) // 远程连接失败
      } else if ("disconnectSeatLink" == data.type) { // 坐席连接断开
        onDisconnectSeatLink()
      }
    } else if ("agentReply" == data.eventKey) {
      s_toNumber = data.fromNumber // gonnghao
      s_jobId = data.jobId
      var content = unescape(data.content)
      console.log("agentReply--" + data)
      if (data.srvType == "dialogEvent" && data.type == "ack") { // 已于坐席建立连接
        onAgentAckEvent(s_toNumber, content, s_jobId)
      } else if ((data.srvType == "statusManage" &&
          (data.type == "transferGroup" || data.type == "transfer")) ||
        "10" == data.contentType) { // zhuanjie
        var state = 1
        if ("10" == data.contentType) {
          state = 2
        }
        onAgentTransferEvent(state, s_toNumber, content) // state 1 正在转接,
        // 2 转接成功
      } else if (data.srvType == "dialogEvent" && data.type == "send") { // 接收坐席端消息
        if ("_U3C_SAT_" == content) { // 满意度
          onAgentToUserSatisEvent(content)
        } else if ("0" == data.contentType) { // 座席端发送文本,表情
          onAgentToUserTextEvent(s_toNumber, content)
        } else if ("1" == data.contentType) { // 座席端发送图片
          var picUrl = data.content.split('|')
          var _begin = picUrl[0]
          var _end = picUrl[1]
          if (isProxy) {
            var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId)
            _hostname = _hostname.split(":")[0] + ":8080"
            _begin = 'http://' + _begin.replace(_begin.substring(0, _begin.indexOf('/recorderfileserver')), _hostname)
            _end = 'http://' + _end.replace(_end.substring(0, _end.indexOf('/recorderfileserver')), _hostname)
          }
          var fileUrl = [_begin, _end]
          onAgentToUserPicEvent(s_toNumber, fileUrl)
        } else if ("2" == data.contentType) { // 座席端发送文件
          var url = data.content.split('|')
          var fileName = url[0] // 文件名
          var fileUrl = url[1]
          if (isProxy) {
            var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId)
            _hostname = _hostname.split(":")[0] + ":8080"
            fileUrl = 'http://' + fileUrl.replace(fileUrl.substring(0, fileUrl.indexOf('/recorderfileserver')), _hostname)
          }
          // url资源路径
          var downLoad_url = webbot_url + "/uipcc/customer/servlet/DownLoadServlet?downFile=" + fileUrl + "/" + fileName + "&fileName=" + fileName + "&contentType=2"
          onAgentToUserFileEvent(s_toNumber, fileName, downLoad_url)
        } else if ("4" == data.contentType) { // 座席端发送webcall
          toSendWebCall(data)
        } else if ("5" == data.contentType) { // 座席端发送远程连接 远程的状态
          // 远程协助
          /**
           * content=="agentAccept建立远程请求 content=="creationComplete申请远程控制
           * content=="agentReject座席拒接您的远程协助申请 content.indexOf("stream=") >=
           * 0 建立长连接,打开远程窗口 content==="startRemoteAssistance收到远程协助请求
           * content==="stopRemoteAssistance对方已结束远程协助连接
           * content==="stopOtherSideRemoteAssistance对方已结束远程协助连接
           * content=="applyControl对方已接受你的远程控制请求
           * content=="rejectControl对方拒绝你的远程控制请求
           * content=="stopControl成功取消控制
           */
          remoteCallBack(s_jobId, data.toNumber, s_toNumber, content)
        } else if ("10" == data.contentType) { // zhuanjiechenggong
          onAgentTransfered(s_toNumber, content)
        }
      } else if (data.srvType == "dialogEvent" && data.type == "close") { // 服务端关闭连接
        if (data.fromNumber == "Administrator") {
          onAgentHangUpEvent(1) // 1：表示系统超时挂断
        } else if (data.fromNumber == "timeout") {
          onAgentHangUpEvent(2) // 2：坐席拒接
        } else {
          onAgentHangUpEvent(0) // 0: 表示坐席主动挂断
        }
        heartBeat.clear()
      }
    } else if ("leavingMsg" == data.eventKey) {
      onSendLeavingMsgBack(data.success)
    }
  })
}

function setWebSocketConnected() {
  webSocketConnected = true
}

/**
 * 心跳接口
 */
const reconnect = {
  timeout: 3000, // 60ms
  timeoutObj: null,
  clear: function () {
    clearTimeout(this.timeoutObj)
  },
  start: function () {
    this.timeoutObj = setTimeout(function () {
      siconnection(s_userName, resumable)
    }, this.timeout)
  }
}

/**
 * 获取历史聊天记录接口 提供服务端接口
 */
function getHistoryMsg(curPage, limit, startTime, endTime, callback) {
  var url = webchat_getDetails + "?source=client&fromNumber=" + sip_userName + "&start=" + curPage + "&limit=" + limit + "&startTime=" + startTime + "&endTime=" + endTime
  doJsonGet(url, function (result) {
    callback(result)
  })
}

function customerinfojson(webNickName, webClientName, webClientAccount, webClientphone, cus_info, loginType) {
  this.webNickName = webNickName
  this.webClientName = webClientName
  this.webClientAccount = webClientAccount
  this.webClientphone = webClientphone
  this.cus_info = cus_info
  this.loginType = loginType
}

/** ****************webdchat 返回值处理函数******************* */
import jsonp from 'jsonp'

function doJsonGet(url, callback) {
  jsonp(url, (err, data) => {
    if (err) {
      console.error(err.message)
    } else {
      callback(data)
    }
  })
  // $.ajax({
  //   type: 'get',
  //   url: url,
  //   dataType: 'jsonp',
  //   jsonp: 'jsonpCallback',
  //   success: function (data) {
  //     callback(data)
  //   }
  // })
}

function doJsonPost(type, url, data, callback) {
  $.ajax({
    type: type,
    url: url,
    dataType: 'JSON',
    accept: "application/json charset=utf-8",
    contentType: "application/json charset=utf-8",
    data: type == 'POST' ? data : null,
    success: function (result) {
      if (callback != null)
        callback(result)
    },
    error: function (xmlhttp, status) {
      var result = { resultCode: '-1', resultText: "连接异常(" + status + ")", errorCode: status }
      callback(result)
    }
  })
}

function doServletPost(type, url, data, callback) {
  $.ajax({
    type: type,
    url: url,
    data: type == 'POST' ? data : null,
    success: function (result) {
      if (callback != null)
        callback($.parseObj(result))
    },
    error: function (xmlhttp, status) {
      var result = { resultCode: '-1', resultText: "连接异常(" + status + ")", errorCode: status }
      callback(result)
    }
  })
}

//修改满意度开关状态
function modifyWebchatSatisfyControl(satisfyControl) {
  webchat_satisfy_control = satisfyControl
}

export default {
  login,
  logout,
  sendMessageBySocktIo
}