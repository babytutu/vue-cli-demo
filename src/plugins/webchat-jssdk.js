/**
 * ********************************websocket
 * *******sockJS***********************************
 */
var wsConn_main = null;// 建立websocket链接

var siConn_main = null;// 建立socket.io链接

// 客户的唯一标识
var s_userName = "";

var sip_userName = "";
// 客户的昵称
var s_name = "";
var s_userTel="";
// 客户优先级等级
var s_vipLevel="";
// 客户优先级等级
var s_displayVipLevel="";
// 客户选择的队列
var s_queue="";
// 技能
var s_remarks="";
// 客户选择的技能
var s_skill="";
var s_curfromNumberName="";// s_name+'|'+s_userTel;
// 转人工后生成jobId
var s_jobId="";
//
var s_toNumber = "";
// 客户的电话号码
var s_phoneNumber = "";

var webSocketConnected = false;

var s_host ="";

var s_isDeptId = "";

var s_deptId = "";

var socket_io_url="";
var webchat_login='';
var webchat_sendFile='';
var webchat_satis='';
var webchat_getDetails='';

var ws_state=0;
var use_ws=true;

var disconnection=0;
var socketio_connectEvent="connect";
var socketio_disconnectEvent="disconnect";
var socketio_errorEvent="error";
var socketio_messageEvent="chatevent";
var manualDisConnect=false;
var webchat_satisfy_control = '';
//sockt.io连接
var resumable=false;
function siconnection(userName, p_resumable) {
	console.log("用户:"+userName+"的socket.io连接开始");
	s_userName = userName;
	sip_userName = "sip:"+s_userName+"@u3c.com";
	var url =  socket_io_url;
	console.log("socket.io服务器连接地址:"+url);
	var options={'reconnect':false,'auto connect':false,"force new connection":true};
	siConn_main =io.connect(url,options);
	ws_state = siConn_main.io.readyState;
	if (true == p_resumable || "true" == p_resumable) {
		resumable = true;
	} else {
		resumable = false;
	}
	siConn_main.on(socketio_connectEvent,function() {
		console.log("socket.io连接成功,并将用户名存入缓存");
		var json = $.toJSON({userName: s_userName, resumable:resumable});
		//打开连接时将客户会话存在缓存中
		sendMessageBySocktIo(siConn_main,"Websocket_open",json);
		//heartBeat.start();
		setWebSocketConnected();
		reconnect.clear();// 清除重连定时器
    });
    siConn_main.on(socketio_disconnectEvent,function() {
    	console.log("socket.io连接已断开=====");
    	
    	if(siConn_main!=null&&!manualDisConnect){
    		console.log("重新连接");
    		reconnect.start();// 重连
    		disconnection = 1;
    		onDisConnectionEvent(disconnection);
    	}
    });
/*	siConn_main.on(socketio_errorEvent,function(){
		console.log("socket.io连接错误,稍后再试");
		ws_state = siConn_main.io.readyState;
		use_ws=false;
		console.log("socket.io重新连接");
		siConn_main.disconnect();
		reconnect.start();
		//siConn_main.reconnect();// 重连
		disconnection = 1;
		onDisConnectionEvent(disconnection);
	});*/
	

	siConn_main.on(socketio_messageEvent, function(json) {
//		heartBeat.reset();// 更新心跳
		var data=eval('(' + json + ')');
		console.log("服务端响应处理");
		if ("heartbeat" == data.eventKey) {
			if(data.resultCode == 0){
				disconnection = 2;
			}else{
				logout();
			}
		} else if ("searchAnswer" == data.eventKey) {
			onRobbotAnswer(data.resultCode, data.resultText, data.msgId, data.remark);
		} else if ("clientSendReply" == data.eventKey) {
			console.log("clientSendReply---"+data);
			if("toAgent"==data.type){// 请求转人工 的返回
				s_jobId = data.resultPath.jobId;
				modifyWebchatSatisfyControl(data.satisfyControl);
				onAgentServiceBack(data.resultCode, data.resultText);
			}else if("sendText"==data.type){// 发送文本消息
				onSendTextBack(data.resultCode, data.resultText, data.msgId, data.remark);
			}else if("sendFile"==data.type){// 发送文件
				var _fileUrl = data.fileUrl;
				if(isProxy){
					var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId);
					_hostname = _hostname.split(":")[0] + ":8080";
					_fileUrl = _fileUrl.replace(_fileUrl.substring(0,_fileUrl.indexOf('/recorderfileserver')),_hostname);
				}
				onSendFileBack(data.resultCode, data.resultText, _fileUrl, data.msgId, data.subFileType);
			}else if("sendPic"==data.type){// 发送图片消息
				var _begin = data.resultPath.begin;
				var _end = data.resultPath.end;
				if(isProxy){
					var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId);
					_hostname = _hostname.split(":")[0] + ":8080";
					_begin = 'http://'+_begin.replace(_begin.substring(0,_begin.indexOf('/recorderfileserver')),_hostname);
					_end = 'http://'+_end.replace(_end.substring(0,_end.indexOf('/recorderfileserver')),_hostname);
				}
				var fileUrl = [_begin, _end];
				onSendPicBack(data.resultCode, data.resultText, fileUrl, data.msgId);
			}else if("sendRemote"==data.type){// 请求远程的返回
				onSendRemote(data.resultCode, data.resultText);// 远程连接失败
			}else if("disconnectSeatLink"==data.type){// 坐席连接断开
				onDisconnectSeatLink();
			}
		} else if ("agentReply" == data.eventKey) {
			s_toNumber = data.fromNumber;// gonnghao
			s_jobId = data.jobId;
			var content = unescape(data.content);
			console.log("agentReply--"+data);
			if (data.srvType == "dialogEvent" && data.type == "ack") {// 已于坐席建立连接
				onAgentAckEvent(s_toNumber, content, s_jobId);
			}else if((data.srvType == "statusManage" 
					&& (data.type == "transferGroup" || data.type == "transfer"))
					|| "10"==data.contentType){ // zhuanjie
				var state = 1;
				if("10"==data.contentType){
					state=2;
				}
				onAgentTransferEvent(state, s_toNumber, content);// state 1 正在转接,
																	// 2 转接成功
			}else if(data.srvType == "dialogEvent" && data.type == "send"){ // 接收坐席端消息
				if("_U3C_SAT_"==content){// 满意度
					onAgentToUserSatisEvent(content);
				}else if("0"==data.contentType){// 座席端发送文本,表情
					onAgentToUserTextEvent(s_toNumber, content);
				}else if("1"==data.contentType){// 座席端发送图片
					var picUrl = data.content.split('|');
					var _begin = picUrl[0];
					var _end = picUrl[1];
					if(isProxy){
						var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId);
						_hostname = _hostname.split(":")[0] + ":8080";
						_begin = 'http://'+_begin.replace(_begin.substring(0,_begin.indexOf('/recorderfileserver')),_hostname);
						_end = 'http://'+_end.replace(_end.substring(0,_end.indexOf('/recorderfileserver')),_hostname);
					}
					var fileUrl = [_begin, _end];
					onAgentToUserPicEvent(s_toNumber, fileUrl);
				}else if("2"==data.contentType){// 座席端发送文件
					var url = data.content.split('|');
					var fileName = url[0];// 文件名
					var fileUrl = url[1];
					if(isProxy){
						var _hostname = setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId);
						_hostname = _hostname.split(":")[0] + ":8080";
						fileUrl = 'http://'+fileUrl.replace(fileUrl.substring(0,fileUrl.indexOf('/recorderfileserver')),_hostname);
					}
					// url资源路径
					var downLoad_url = webbot_url+"/uipcc/customer/servlet/DownLoadServlet?downFile="+fileUrl+"/"+fileName+"&fileName="+fileName+"&contentType=2";
					onAgentToUserFileEvent(s_toNumber, fileName, downLoad_url);
				}else if("4"==data.contentType){// 座席端发送webcall
					toSendWebCall(data);
				}else if("5"==data.contentType){// 座席端发送远程连接 远程的状态
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
					remoteCallBack(s_jobId, data.toNumber, s_toNumber, content);
				}else if("10"==data.contentType){// zhuanjiechenggong
					onAgentTransfered(s_toNumber, content);
				}
			}else if(data.srvType == "dialogEvent" && data.type == "close"){// 服务端关闭连接
				if(data.fromNumber=="Administrator"){
					onAgentHangUpEvent(1);// 1：表示系统超时挂断
				}else if(data.fromNumber=="timeout"){
					onAgentHangUpEvent(2);// 2：坐席拒接 
				}else{
					onAgentHangUpEvent(0);// 0: 表示坐席主动挂断
				}
				heartBeat.clear();
			}
		} else if ("leavingMsg" == data.eventKey){
			onSendLeavingMsgBack(data.success);
		} 
});
	
	
	
}

//修改满意度开关状态
function modifyWebchatSatisfyControl(satisfyControl){
	webchat_satisfy_control = satisfyControl;
};
//socktio发送消息
function sendMessageBySocktIo(socket, state, message) {
	console.log("通过socket.io通道发送消息:"+message);
	if (siConn_main!=null) {
		//emit是用来手动触发事件的.
    	socket.emit(socketio_messageEvent,{ message: message,type:state});
    } else {
// wsconnection(s_userName, s_isDeptId, s_deptId);
    }
}



//socktio登出
function logout(){

	
	
	if (siConn_main!=null) {
		var closeData =$.toJSON({userName : s_userName});
		console.log("用户登出时关闭socket.io通道:"+closeData);
		sendMessageBySocktIo(siConn_main,"Webbot_close",closeData);
		sendMessageBySocktIo(siConn_main, "Websocket_close", closeData);
		
		manualDisConnect=true;
		siConn_main.disconnect();
		siConn_main=null;
    }
};
/**
 * ===============================客户端发送接口 socktio连接=================================
 */
/**
 * 登录接口 return resultCode 0 success, -1 error
 */
function login(userName, nickName, userTel, vipLevel,deptFlag,dept, cus_info, loginType, callback){
	console.log("客户侧用户登录:"+userName);
	// 登陆方式
	var random = "web"+Math.round(Math.random() * 1000000);// 生成客户号码
	s_userName = random+userName+'-'+dept;
	s_isDeptId = deptFlag;
	s_deptId = dept;
	s_userTel = userTel;
    s_name = nickName;
    s_vipLevel = vipLevel;
    s_remarks = new customerinfojson('1',"2","3","5",cus_info,loginType);
    s_curfromNumberName = s_name+'|'+s_userTel;
    // 设置代理
    setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId);
	var _param="?userName="+s_userName+"&name="+s_name+"&userId="+s_userName+"&userTel="+s_userTel+"&vipLevel="+s_vipLevel+
	"&queue=null"+"&skill=null"+"&remarks="+s_remarks+"&resumable=false";
	var url = webchat_login + _param;
	console.log("url==="+url);
	doJsonGet(url, function(obj){
		
		
		if(obj.resultCode == "0"){
			console.log("登录成功");
			callback(obj);
			siconnection(s_userName, obj.resumable);
		}else if(obj.resultCode == "-1"){
			console.log("登录出错"+obj);
			window.location.reload();
		}
	});
};
function loginResumable(userName, nickName, userTel, vipLevel,deptFlag,dept, cus_info, loginType, callback){
	s_userName = "web"+userName+'-'+dept;
	s_isDeptId = deptFlag;
	s_deptId = dept;
	s_userTel = userTel;
    s_name = nickName;
    s_vipLevel = vipLevel;
    s_remarks = new customerinfojson('1',"2","3","5",cus_info,loginType);
    s_curfromNumberName = s_name+'|'+s_userTel;
    // 设置代理
    setProxyUrlSocktIO(isProxy, ipAndPort, s_isDeptId, s_deptId);
	var _param="?userName="+s_userName+"&name="+s_name+"&userId="+s_userName+"&userTel="+s_userTel+"&vipLevel="+s_vipLevel+
	"&queue=null"+"&skill=null"+"&remarks="+s_remarks+"&resumable=true";;
	var url = webchat_login + _param;
	doJsonGet(url, function(obj){
		if(obj.resultCode == "0"){
			callback(obj);
			siconnection(s_userName,obj.resumable);
		}else if(obj.resultCode == "-1"){
			alert(obj.resultText);
			window.location.reload();
		}
	});
}

function wrapMsgId(msgId) {
	var innerMsgId;
	if ((typeof msgId) == "undefined") {
		innerMsgId = "";
	} else {
		innerMsgId = msgId;
	}
	return innerMsgId;
};
/**
 * 机器人应答接口 return data.resultCode == '0' success, data.resultCode == '-1'
 * failure
 */
function sendQuestionToRobbot(content, msgId, remark){
	console.log("sendQuestionToRobbot=="+content);
	var wrappedMsgId = wrapMsgId(msgId);
	var postData =  $.toJSON({question:content,userName : s_userName, msgId: wrappedMsgId, remark:remark});
	
	sendMessageBySocktIo(siConn_main,"SearchAnswer_question",postData);
	//sendMessage(wsConn_main,"SearchAnswer_question",postData);
};

function sendmessJS(){
	socket.emit('message', json);
}

/**
 * 转人工接口
 * 
 * @param serviceType
 *            服务类型 即所选择的队列ID
 * @param skillType
 *            服务技能
 * @returns
 */
function connectAgentService(serviceType,skillType){
	
	s_queue = "sip:"+serviceType+"@acd.u3c.com";
	var curfromNumberName=s_curfromNumberName;
	var postData = $.toJSON({type:"open", fromNumber:sip_userName,queueUri:s_queue,deptId:s_deptId, skill:skillType, userName:curfromNumberName,remarks:s_remarks,vipLevel:s_vipLevel,displayVipLevel:s_displayVipLevel});
	//sendMessage(wsConn_main,"ClientSend_request",postData);
	sendMessageBySocktIo(siConn_main,"ClientSend_request",postData);
	
};

/**
 * 转人工接口(转指定座席)
 * @param agentId
 *            座席工号（ipcc平台内）
 * @param serviceType
 *            服务类型 即所选择的队列ID
 * @param skillType
 *            服务技能
 * @returns
 */
function connectTargetAgentService(agentId,serviceType,skillType, cusInfo){
	
	s_queue = "sip:"+serviceType+"@acd.u3c.com";
	var toNumber = "sip:"+agentId+"@u3c.com";
	var curfromNumberName=s_curfromNumberName;
	var postData = $.toJSON({type:"open", cusInfo:cusInfo,fromNumber:sip_userName, toNumber:toNumber,queueUri:s_queue,deptId:s_deptId, skill:skillType, userName:curfromNumberName,remarks:s_remarks,vipLevel:s_vipLevel,displayVipLevel:s_displayVipLevel});
	//sendMessage(wsConn_main,"ClientSend_request",postData);
	sendMessageBySocktIo(siConn_main,"ClientSend_request",postData);
	
};

/**
 * 发送留言接口
 * 
 * @param userName
 *            客户姓名
 * @param userTel
 *            客户电话
 * @param title
 *            留言标题
 * @param content
 *            留言内容
 */
function sendLeaveMsg(userName, userTel,title, content){
    var param = $.toJSON({type:1,username:userName,phone:userTel,title:title,content:content,from:from_leave_mail,to:to_leave_mail});
	//sendMessage(wsConn_main,"LeavingMessage_send",param);
    sendMessageBySocktIo(siConn_main,"LeavingMessage_send",param);
};

/**
 * contentType	11
 * @param {Object} content
 */
function sendLocationToAgent(content){
	if(!s_jobId){
		alert('请先与座席建立连接后在调用该接口');
		return;
	}
	var postData = $.toJSON({type:"send",jobId:s_jobId, fromNumber:sip_userName,toNumber:s_toNumber,queue:s_queue, message:content,userName:s_curfromNumberName,contentType:"11"});
	//sendMessage(wsConn_main,"ClientSend_sendMessage",postData);
	sendMessageBySocktIo(siConn_main,"ClientSend_sendMessage",postData);
}

/**
 * contentType	12
 * @param {Object} content
 */
function sendTempMessageToAgent(content){
	if(!s_jobId){
		alert('请先与座席建立连接后在调用该接口');
		return;
	}
	var postData = $.toJSON({type:"send",jobId:s_jobId, fromNumber:sip_userName,toNumber:s_toNumber,queue:s_queue, message:content,userName:s_curfromNumberName,contentType:"12"});
	//sendMessage(wsConn_main,"ClientSend_sendMessage",postData);
	sendMessageBySocktIo(siConn_main,"ClientSend_sendMessage",postData);

}
/**
 * 自定义发送消息
 * @param {Object} content  消息内容
 * @param {Object} contentType  消息类型
 */
function sendContentToAgent(content, contentType){
	console.log(contentType);
	if(contentType==='0' || contentType==='1' || contentType==='2' || contentType==='3' ||
			contentType==='4' || contentType==='5' || contentType==='8'){
		/**
		 * 1	pc端图片类型
		 * 2	pc文件类型
		 * 3	被过滤词汇  修改发送给assf的消息类型
		 * 4	webcall 网络电话
		 * 5	远程服务
		 * 8	移动端发送图片
		 */
		alert('请调用对应类型的接口');
		return;
	}
	if(!s_jobId){
		alert('请先与座席建立连接后在调用该接口');
		return;
	}
	var postData=$.toJSON({type:"send",jobId:s_jobId, fromNumber:sip_userName,toNumber:s_toNumber,queue:s_queue, message:content,userName:s_curfromNumberName,contentType:contentType});
	console.log(postData);
	//sendMessage(wsConn_main,"ClientSend_sendMessage",postData);
	sendMessageBySocktIo(siConn_main,"ClientSend_sendMessage",postData);

}
/**
 * 与客户聊天接口
 * 
 * @param message
 *            消息体
 * @param messageType
 *            消息类型
 */
function sendTextToAgent(message, msgId, remark){
	var wrappedMsgId = wrapMsgId(msgId);
	var postData=$.toJSON({type:"send",jobId:s_jobId, fromNumber:sip_userName,toNumber:s_toNumber,queue:s_queue, message:message,userName:s_curfromNumberName,contentType:'0', msgId:wrappedMsgId, remark:remark});
	//sendMessage(wsConn_main,"ClientSend_sendMessage",postData);
	sendMessageBySocktIo(siConn_main,"ClientSend_sendMessage",postData);

	
	
};

function sendPicToAgent(message, msgId){
	var postData = '';
	var picName = s_userName+"_"+Math.round(Math.random() * 1000000);
    var picLen = message.length;
    var subLen = 3072;
    var contents=new Array();
    var dataCount = Math.ceil(picLen/subLen);
    var wrappedMsgId = wrapMsgId(msgId);
    for(var i=0;i<dataCount;i++){
    	var start = i * subLen;
    	var end = (i+1)* subLen;
    	contents[i] = message.substring(start,end);
    	postData = $.toJSON({type:"send",picName:picName, jobId:s_jobId, fromNumber:sip_userName, toNumber:s_toNumber,queue:s_queue,message:contents[i],dataCount:dataCount,currentCount:i,userName:s_curfromNumberName,contentType:'1', msgId:wrappedMsgId});
    	//sendMessage(wsConn_main,"ClientSend_sendMessage",postData);
    	sendMessageBySocktIo(siConn_main,"ClientSend_sendMessage",postData);

    }
}

/**
 * 文件上传 messageId 文件上传域的ID
 */
function sendFileToAgent(fileElementId, msgId, subFileType){
	var url = webchat_sendFile;
	var curtoNumber = "sip:"+s_toNumber+"@u3c.com";
	var picName = s_userName+"_"+Math.round(Math.random() * 1000000);
	var wrappedMsgId = wrapMsgId(msgId);
// console.log(url+'\n curfromNumber'+curfromNumber+curtoNumber);
	$.ajaxFileUpload({
         url: url, // 用于文件上传的服务器端请求地址
         secureuri: false, // 是否需要安全协议，一般设置为false
         fileElementId: fileElementId, // 文件上传域的ID
         
        // data:{type:"send",picName:s_userName, jobId:s_jobId, fromNumber:sip_userName, toNumber:s_toNumber,queue:s_queue,userName:s_curfromNumberName,contentType:'2'},
        data:{jobId: s_jobId, fromNumber: sip_userName, toNumber: curtoNumber, userName: s_userName, contentType: '2',subFileType: subFileType,picName:picName, queue:s_queue,dataCount:'6',currentCount:'5',cuserName:s_curfromNumberName, stoNumber:s_toNumber, msgId:wrappedMsgId},
         dataType: 'JSON', // 返回值类型 一般设置为json
         success: function (data, status){  // 服务器成功响应处理函数
// console.log(data);
        	 $("#"+fileElementId).change(function(){
        		 sendFileToAgent(this.id);
        		 $("#"+fileElementId).val('');
             }); 
         },
         error: function (data, status, e)// 服务器响应失败处理函数
         {
// console.log(data);
         }
     })
};
// 获取历史聊天记录接口 提供服务端接口
function getHistoryMsg(curPage, limit, startTime,endTime,callback){
    var url = webchat_getDetails +"?source=client&fromNumber="+sip_userName+"&start="+curPage+"&limit="+limit+"&startTime="+startTime+"&endTime="+endTime;
    doJsonGet(url, function(result){
        callback(result);
    });
};
/**
 * satifacton表示满意度评价标识、desc表示客户填写的建议。 满意度接口
 */
// 登出是根据 服务端返回值判断是否触发 SatifactionbeginEvent(jobId)
function SatifactionbeginEvent(jobId){
	var _param=decodeURIComponent("jobId="+jobId+"&satisfactionStartTime="+new Date().getTime());
	var url = webchat_satis +"?"+_param;
    doJsonGet(url, function(obj){});
};

function sendSatisfactionResult(jobId, satisfaction,desc, callback){
	var _param=decodeURIComponent("satisfaction="+satisfaction+"&jobId="+jobId+"&desc="+desc+"&satisfactionTime="+new Date().getTime());
	var url = webchat_satis +"?"+_param;
	doJsonGet(url, function(obj){
		callback(obj);
	});
};


/**
 * 关闭连接 return
 */
/*
 * function closeWebbot(){ var closeData = $.toJSON({userName : s_userName});
 * sendMessage(wsConn_main,"Webbot_close",closeData); }
 */

function setWebSocketConnected(){
	webSocketConnected = true;
}
/**
 * 心跳接口
 */

var reconnect = {
	timeout: 3000,// 60ms
    timeoutObj: null,
    clear: function(){
    	clearTimeout(this.timeoutObj);
    },
    start: function(){
        this.timeoutObj = setTimeout(function(){
// alert('chonnglian ...');
        	siconnection(s_userName, resumable);
        }, this.timeout);
    }
};

var heartBeat = {
    timeout: 4000,// 60ms
    timeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);
        this.start();
    },
    clear:function(){
    	clearInterval(this.timeoutObj);
    },
    start: function(){
//     this.timeoutObj = setInterval(function(){   
//	 alert('heart ...');
//        	sendMessage(wsConn_main,"Heartbeat_heartbeat",$.toJSON({userName:s_userName}));
//        }, this.timeout);
      //this.timeoutObj = setInterval('sendMessage(wsConn_main,"Heartbeat_heartbeat",$.toJSON({userName:s_userName}));', this.timeout);
      this.timeoutObj = setInterval('sendMessageBySocktIo(siConn_main,"Heartbeat_heartbeat",$.toJSON({userName:s_userName}));', this.timeout);


    }
};

/** ****************webdchat 返回值处理函数******************* */

function doJsonGet(url, callback){
		$.ajax({
		type: 'get',
		url:  url,
		dataType:'jsonp',
		jsonp:'jsonpCallback',
		success: function(data){
		    callback(data);
		}
	});
};

function doJsonPost(type, url, data, callback) {
	$.ajax({
		type: type,
		url:  url,
		dataType:'JSON',
		accept: "application/json; charset=utf-8",
		contentType: "application/json; charset=utf-8",
		data: type == 'POST' ? data : null,
		success: function(result){
		    if (callback != null)
				callback(result);
		},
		error: function(xmlhttp, status) {
			var result = {resultCode:'-1', resultText:"连接异常(" + status + ")", errorCode:status};
			callback(result);
		}
	});
};

function doServletPost(type, url, data, callback) {
	$.ajax({
		type: type,
		url:  url,
		data: type == 'POST' ? data : null,
		success: function(result){
			if (callback != null)
				callback($.parseObj(result));
		},
		error: function(xmlhttp, status) {
			var result = {resultCode:'-1', resultText:"连接异常(" + status + ")", errorCode:status};
			callback(result);
		}
	});
};

$.extend({
	// 将字符串转成OBJECT对象
	parseObj : function(strData){
		try{
		  var type = typeof strData;
		  if(('object' == type)) return strData;
		  return (new Function( "return " + strData ))();
		}catch(e){
			return null;
		}
    },

	/**
	 * *
	 * 
	 * @see 将javascript数据类型转换为json字符串 *
	 * @param 待转换对象,支持object,array,string,function,number,boolean,regexp *
	 * @return 返回json字符串
	 */
	toJSON : function(object) {
		var type = typeof object;
		try{
		 if ('object' == type) {
			if (Array == object.constructor)
				type = 'array';
			else if (RegExp == object.constructor)
				type = 'regexp';
			else
				type = 'object';
		  }
		}catch(e){
			type = 'unknown';
		}
		switch (type) {
		case 'undefined':
		case 'unknown':
			return '';
			break;
		case 'function':
		case 'boolean':
		case 'regexp':
			return object.toString();
			break;
		case 'number':
			return isFinite(object) ? object.toString() : 'null';
			break;
		case 'string':
			return '"'
					+ object.replace(/(\\|\")/g, "\\$1").replace(
							/\n|\r|\t/g,
							function() {
								var a = arguments[0];
								return (a == '\n') ? '\\n'
										: (a == '\r') ? '\\r'
												: (a == '\t') ? '\\t' : ""
							}) + '"';
			break;
		case 'object':
			if (object === null)
				return 'null';
			var results = [];
			for ( var property in object) {
				var value = jQuery.toJSON(object[property]);
				if (value !== undefined)
					results.push(jQuery.toJSON(property) + ':' + value);
			}
			return '{' + results.join(',') + '}';
			break;
		case 'array':
			var results = [];
			for ( var i = 0; i < object.length; i++) {
				var value = jQuery.toJSON(object[i]);
				if (value !== undefined)
					results.push(value);
			}
			return '[' + results.join(',') + ']';
			break;
		}
	}
});

//获取代理 domain
function setProxyUrlSocktIO(isproxy, host, isdeptid, dept){// department id/name
	console.log("获取代理 domain");
	var _host = "";
	var departments = "";
	if(isdeptid =="1"){
		departments = 'deptid/'+dept;
	}else if(isdeptid =="2"){
		departments = 'deptname/'+dept;
	}
//	_host = (isproxy && dept != '') ? (host + '/uipcc/'+departments) : (host);
	_host = host;
	// http://[domain]/uipcc/deptid/[deptid]/ucagent/portal_proxy.jsp?deptId=101&name=1000&isProxyWithDeptId=true
	socket_io_url='http://' + host.split(":")[0]+":9909";
	
	webchat_login='http://'+ _host +'/ucWebchat2CustomerServer/servlet/webchat_service/login';
	webchat_sendFile='http://'+ _host+'/ucWebchat2CustomerServer/servlet/upload';
	webchat_satis='http://'+ _host +'/ucWebchat2CustomerServer/servlet/satisfaction';
	webchat_getDetails='http://'+ _host +'/ucWebchat2CustomerServer/servlet/history';
	return _host;
};

function getCurrentDateTime(){
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hour = date.getHours();
	var minute = date.getMinutes();
	var second = date.getSeconds();
	
	return [year,month,day].map(format).join('-')+' '+[hour,minute,second].map(format).join(':');
}
function format(n){
	n = n.toString();
	return n[1]?n:'0'+n;
}
// 获取机构配置信息
function getDeptConfig(deptid,confkey){
	return (deptid == '') ? eval(confkey) : eval(('_'+deptid + confkey));
};

function customerinfojson(webNickName,webClientName,webClientAccount,webClientphone,cus_info,loginType){
	this.webNickName = webNickName;
	this.webClientName = webClientName;
	this.webClientAccount = webClientAccount;
	this.webClientphone = webClientphone;
	this.cus_info = cus_info;
	this.loginType = loginType;
};