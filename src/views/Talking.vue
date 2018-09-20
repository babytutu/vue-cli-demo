<template>
	<div class="talkChat">
		<el-container>
			<el-header class="clearfix;" style="height:4.75rem;">
				<div style="position:fixed;height:4.75rem;width:24rem;top:0px;left:50%;transform: translateX(-50%);text-align: center;line-height: 4.75rem"
				    id="info">

				</div>
				<div class="fl" style="width:8.5rem">
					<img :src="logouri" alt="" style="width:100%;height:100%;">
				</div>
				<div class="fr">
					<span style="font-size:1rem;font-weight:700;line-height: 1.8rem">{{contentone}}</span>
					<br>
					<span style="line-height: 1.8rem;">{{contenttwo}}</span>
					<span clas="fr"></span>
				</div>
			</el-header>
			<el-main style="width:100%;height: 100%;display: block;">
				<div style="width:80%;height:100%;max-height:800px;margin: 0 auto;position: relative;" id="talkchatMain">
					<div class="elmain-right fr" style="height: 100%;float: right;width: 25rem;">
						<div style="position: relative;width:100%;height:100%;">
							<div class="lastTimeQues" style="position: absolute;">
								<el-tabs v-model="activeName1" type="card">
									<el-tab-pane label="相关问题" name="first">
										<template v-for="(item) in alikeQuestions">
											<a href="javascript:void(0);" @click="linkQuestion(item.question)" :key="item.faqId">{{item.question}}</a>
											<br>
										</template>
									</el-tab-pane>
									<el-tab-pane label="最近搜索" name="two" v-html="historyQuestions">
									</el-tab-pane>
								</el-tabs>
							</div>
							<div class="moreLink" style="position: absolute;bottom:50px;top:320px;width:100%;">
								<el-tabs v-model="activeName" type="card">
									<el-tab-pane label="便捷服务" name="first">
										<ul>
											<li v-for="(item,index) in queueGroups" @click="gomoreLink(item)" class="liPos" :style="{background:colorArray[index%6]}">
												{{item.queueName}}
												<span class="monitor-icon-my-iconfontgongzuo" style="position: absolute;bottom:2px;right:5px;font-size:26px;">

												</span>
											</li>
										</ul>
									</el-tab-pane>
								</el-tabs>
							</div>
							<div class="uptoLink" style="position: absolute;bottom:0px;height:50px;width:100%;">
								<span style="margin-top:0.625rem;margin-right:0.3125rem;padding:0 10px;height:30px;display: inline-block;background: #409eff;color:#fff;text-align: center;border-radius: 4px;cursor: pointer;line-height: 30px;"
								    @click="moreChance" class="fr">更多便捷服务</span>
							</div>
						</div>
					</div>
					<div class="elmain-left" style="margin-right: 25rem;height: 100%;">
						<div style="overflow: auto;" id="user-main">
							<ul class="talkContenthistory">
								<li class="clearfix">
									<div class="clearfix">
										<!-- <div class="fl divImg"></div> -->
											<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">										
										<div class="fl divli">
											<a class="talkBoxSingle"></a>
											<span class="colorBlue">小远</span>
											<span class="fr colorBlue">{{new Date().toLocaleString()}}</span>
											<p class="pStyle">{{welcomes}}</p>
										</div>
									</div>
								</li>
								<li>
									<!-- <span class="fl monitor-icon-my-omni spanImg">
									</span> -->
									<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">
									<div id="commonQuestion" style="margin-left:80px;cursor: pointer;" v-show="normalQuestion.length != 0">
										<a class="talkBoxSingle"></a>
										<span>小远猜您想了解</span>
										<ul>
											<li v-for="item in normalQuestion" class="one_txt_cut" :key="item.faqId">
												<a @click="answerComQuestion(item)" class="askQuestion">{{item.question}}</a>
											</li>
										</ul>
									</div>
								</li>

							</ul>
						</div>
						<div class="chatBtns">
							<el-tooltip class="item" effect="dark" content="机器人" placement="top">
								<span class="monitor-icon-my-zaixiankefu-zuoxi" @click="transferRobet"></span>
							</el-tooltip>
							<el-tooltip class="item" effect="dark" content="表情" placement="top" v-show="!isRobet">
								<span class="monitor-icon-my-zhuangtai-Qwo" @click="showFace"></span>
							</el-tooltip>
							<el-tooltip class="item" effect="dark" content="截图" placement="top" v-show="!isRobet">
								<Vniuniu class="monitor-icon-my-printscreen"></Vniuniu>
							</el-tooltip>
							<label for="sendFile" v-show="!isRobet">
								<input type="button" id="btn" value="文件发送">
								<!-- <span id="txt"></span> -->
								<input type="file" id="sendFile" name="sendFile" title="点击发送文件">
							</label>
							<el-tooltip class="item" effect="dark" content="退出" placement="top">
								<span class="monitor-icon-my-quit fr" @click="loginOut"></span>
							</el-tooltip>
							<el-tooltip class="item" effect="dark" content="转人工" placement="top" v-show="!isConnected">
								<span class="monitor-icon-my-kefu fr" @click="transManmade" style="position: relative;"></span>
							</el-tooltip>
							<vface v-show="faceShow" id="faceP" v-on:listenFromface="getIpccitem"></vface>
						</div>
						<div style="padding:5px;box-sizing:border-box">
							<div contenteditable="true" style="width:100%;height:100%;padding-left:5px;padding-top:3px;box-sizing:border-box;line-height: 1.5rem;outline: none"
							    id="talkCon" @keydown.enter="sendMessage">
							</div>
						</div>
						<div>
							<div class="fl" style="margin-top:10px;margin-left:0.3125rem" v-show="isRobet">
								答案满意度:
								<el-radio v-model="radioRobot" label="1">非常满意</el-radio>
								<el-radio v-model="radioRobot" label="2">满意</el-radio>
								<el-radio v-model="radioRobot" label="3">不满意</el-radio>
								<el-radio v-model="radioRobot" label="4">很差</el-radio>
								<span style="padding:0 10px;height:30px;display: inline-block;background: #409eff;color:#fff;text-align: center;border-radius: 4px;cursor: pointer;line-height: 30px;"
								    @click="RobotSubmit">提交</span>
							</div>
							<span style="margin-top:0.625rem;margin-right:0.3125rem;padding:0 10px;height:30px;display: inline-block;background: #409eff;color:#fff;text-align: center;border-radius: 4px;cursor: pointer;line-height: 30px;"
							    @click="sendMessage" class="fr">发送消息</span>
						</div>
					</div>
				</div>
			</el-main>
		</el-container>
		<el-dialog title="图片展示" :visible.sync="dialogTableVisible" width="90%" id="dialogImg">
			<img :src="imgurl" />
		</el-dialog>
		<el-dialog title="满意度调查" :visible.sync="dialogTableVisible1" id="staticif">
			感谢您使用在线客户服务，请填写您对本次服务满意度调查意见:
			<br/>
			<el-radio v-model="radio" label="1">满意</el-radio>
			<el-radio v-model="radio" label="2">一般</el-radio>
			<el-radio v-model="radio" label="3">较差</el-radio>
			<el-radio v-model="radio" label="4">恶劣</el-radio>
			<el-input type="textarea" :rows="6" placeholder="请输入您宝贵的建议" v-model="textarea2">
			</el-input>
			<el-button type="primary" @click="staticSubmit" style="margin-top:20px;">提交</el-button>
		</el-dialog>
	</div>
</template>
<style lang="">
	.talkChat {
		height: 100%;
	}

	.talkChat .el-container {
		height: 100%;
	}

	.chatBtns span,
	.chatBtns Vniuniu {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: inline-block;
		margin-top: 5px;
		margin-left: 10px;
		text-align: center;
		line-height: 40px;
		font-size: 20px;
		cursor: pointer;
		border: 1px solid #ddd;
	}

	.chatBtns #faceP {
		position: absolute;
		z-index: 9999;
	}

	.talkChat .el-header {
		border-bottom: 2px solid #2fb1fc;
	}

	.talkChat .el-header>div {
		height: 3.75rem;
	}

	#talkchatMain>div {
		padding: 0px 0px 0px 0px!important;
		overflow: hidden;
		position: relative;
		border: 1px solid #ddd;
	}

	#talkchatMain>div>div {
		width: 100%;
		position: absolute;
	}

	#talkchatMain>div>div:nth-child(1) {
		bottom: 300px;
		top: 0px;
		padding-left: 10px;
		padding-top: 10px;
		box-sizing: border-box;
	}

	#talkchatMain>div>div:nth-child(1) ul li {
		margin-top: 1rem;
	}

	#talkchatMain>div>div:nth-child(2) {
		height: 50px;
		bottom: 250px;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}

	#talkchatMain>div>div:nth-child(3) {
		height: 200px;
		bottom: 50px;
	}

	#talkchatMain>div>div:nth-child(4) {
		bottom: 1px;
		height: 50px;
		border-top: 1px solid #ddd;
		border-bottom: 1px solid #ddd;
	}

	.lastTimeQues {
		width: 100%;
		overflow: auto;
	}

	.lastTimeQues #pane-first ul li {
		width: 100%;
		height: 1.8rem;
		line-height: 1.8rem;
		padding-left: 5px;
		box-sizing: border-box;
		cursor: pointer;
	}

	.moreLink {
		overflow: auto;
	}

	.moreLink #pane-first ul {
		display: flex;
		justify-content: space-around;
		flex-wrap: wrap;
		align-content: center;
	}

	.moreLink #pane-first ul li {
		width: 7.5rem;
		height: 5rem;
		margin-top: 0.625rem;
		cursor: pointer;
		color: #fff;
		border-radius: 5px;
		padding-left: 5px;
		box-sizing: border-box;
	}

	#commonQuestion {
		width: 60%;
		padding: 1rem;
		box-sizing: border-box;
		background: #f5fafe;
		border: 1px solid #cadff2;
		border-radius: 6px;
		position: relative;
	}

	.talkBoxSingle {
		position: absolute;
		left: -0.5rem;
		top: 1rem;
		width: 1rem;
		height: 1rem;
		background: #f5fafe;
		transform: rotate(45deg);
		border-left: 1px solid #cadff2;
		border-bottom: 1px solid #cadff2;
	}

	#commonQuestion>span {
		width: 100%;
		display: inline-block;
		color: #000;
		font-size: 1.25rem;
		height: 30px;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid #cadff2;
	}

	#commonQuestion ul li {
		box-sizing: border-box;
	}
	/*公共提示语的消息*/

	.sysTippTag {
		word-wrap: break-word;
		word-break: break-all;
		width: 100%;
		color: #000;
		text-align: center
	}

	.spanImg {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		text-align: center;
		line-height: 60px;
		font-size: 40px;
	}
	.divImg{
		background:url(../../static/img/agentImg.png) no-repeat center;
		width:50px;
		height:50px;
		background-size:50px 50px;
		border-radius:5px;
	}
	.agentImg{
		width:50px;
		height:50px;
		border-radius:5px;
	}

	.divli {
		border: 1px solid #cadff2;
		border-radius: 6px;
		margin-left: 20px;
		min-height: 60px;
		padding: 5px 1.25rem;
		box-sizing: border-box;
		min-width: 400px;
		max-width: 60%;
		background: #f5fafe;
		margin-bottom: 10px;
		position: relative;
	}

	label {
		position: relative;
		display: inline;
		cursor: pointer;
	}

	label #sendFile {
		position: absolute;
		left: 10px;
		bottom: -5px;
		opacity: 0;
		width:80px;
		height:30px
	}

	label #btn {
		margin-left: 10px;
		padding: 6px 12px;
		border: none;
		border-radius: 2px;
		cursor: pointer;
	}

	label #txt {
		color: red;
		font-size: 12px;
		width: auto;
		border-radius: 0;
		border: none;
	}

	.pStyle {
		word-wrap: break-word;
		word-break: break-all;
		width: 100%;
		color: #3a7ab7 !important;
	}

	.colorBlue {
		color: #000 !important;
	}

	.askQuestion {
		color: #3a7ab7;
	}

	.lastTimeQues .el-tabs__header {
		margin: 0px;
	}

	.lastTimeQues .el-tabs__content {
		padding: 0.625rem;
		box-sizing: border-box;
	}

	.liPos {
		position: relative;
	}

	.el-tabs__nav-scroll {
		background: #eeeeee;
	}

	.el-tabs__nav {
		background: #fff;
	}

	.el-tabs__item.is-active {
		border-top: 3px solid #2fb1fc
	}
  .myfile{
    cursor: pointer;
    text-decoration: underline;
  }
</style>
<script>
	/* eslint-disable */
	import vface from './common/face.vue'
	import Vniuniu from './common/niuniu.vue'
	import Qs from 'qs'
	var webchatUri = sysConfig.baseUrl;
	$.cookie('JSESSIONID', '9054BD1A4442B4D35148A28A485C789F')
	$.cookie('loginname', 'HangZhouBank')
	$.cookie('password', '123456')
	export default {
		data() {
			return {
				faceShow: false,
				imgurl: 'static/img/face/1.gif',
				textmsg: '',
				sysTipmsg: '',
				usermainHeight: '',
				dialogTableVisible: false,
				fileName: '',
				imgurl: '',
				isRobet: true,
				dialogTableVisible1: false,
				radio: '1',
				radioRobot: '1',
				textarea2: '',
				activeName: 'first',
				activeName1: 'first',
				id: '',
				contentone: '',
				contenttwo: '',
				welcomes: '您好，我是机器人小远，请问我有什么可以帮您?',
				historyQuestions: '',
				alikeQuestions: [],
				queueGroups: [],
				queue: '1002500',
				deptId: '1002',
				istransferFlag: false,
				normalQuestion: [],
				logId: '',
				colorArray: ['#2bc8b7', '#f3782b', '#4580dc', '#dd493b', '#17bdef', '#17bdef'],
				logouri: '../../static/img/logo.jpg',
				recordId: '',
				userName: '',
				nickName: '',
				isConnected: false, //会话是否已建立（false为未建立）
			}
		},
		methods: {
			showFace() {
				this.faceShow = !this.faceShow
			},
			showConnected() {
				this.isConnected = true
			},
			getIpccitem(input) {
				$('#talkCon').append('<img style ="width:1.5rem;height:1.5rem;display:inline-block;" src="' + input[0] + '">')
				this.faceShow = false
			},
			cropImg() {

			},
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
					console.log("self.recordId", self.recordId)
					login(userName, nickName, userTel, viplevel, deptFlag, dept, userInfo, loginType, function (res) {
						console.info('转人工 用户登录的返回结果是：', res);
						if (res.resultCode === "0") {
							setTimeout(function () {
								connectAgentService(self.queue, "")
								self.istransferFlag = true
							}, 1000)
						} else {
							this.message({
								type: 'error',
								message: res.resultText
							})
						}
					});
				} else {
					this.$message({
						type: 'error',
						message: '正在为您转接中，请稍后....'
					})
				}

				localStorage.setItem("notUnderStandCount", '0');
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
				return uuid;
			},
			sendMessage(event) {
				event.cancelBubble = true;
				event.preventDefault();
				event.stopPropagation();
				const self = this
				let str = $('#talkCon').html();
				let strRobot = str
				if (!str || str == '<br>') {
					this.$message({
						type: 'info',
						message: '消息为空，不可发送'
					})
					return false
				}
				if (str.indexOf('data:image/jpg;base64') >= 0) { //说明是大图片
					let str = $('.bigImage').attr('data-id');
					if (this.isRobet) {
						//    sendQuestionToRobbot(str);
					} else {
						sendPicToAgent(str);
					}
					$('#talkCon').html('')
					let string = '<li class="clearfix">' +
						'<div class="clearfix">' +
						'<span class="fr monitor-icon-my-user spanImg">' +
						'</span>' +
						'<div class="fr divli">' +
						'<span class="colorBlue">我</span> <span class="fr colorBlue">' + new Date().toLocaleString() + '</span>' +
						'<img style ="width:130px;"src="data:image/jpg;base64,' + str + '" class="hisImage" data-id="' + str + '"/>' +
						'</div>' +
						'</div>' +
						'</li>'
					$('.talkContenthistory').append(string)
					$('img.hisImage').on('click', function (event) {
						self.dialogTableVisible = true
						self.imgurl = 'data:image/jpg;base64,' + $(event.target).attr('data-id')
					})
					this.usermainHeight = document.getElementById('user-main').scrollHeight;
					return false;
				}
				let sendmsg = str;
				let arrFace = []
				var result = [],
					temp;
				let patt = /<img[^>]+src=['"]([^'"]+)['"]+/g;
				while ((temp = patt.exec(sendmsg)) != null) {
					result.push(temp[1]);
				}
				result.forEach(function (val, index) {
					val = val.replace('static/img/face/', '').replace('.gif', '');
					arrFace.push('[:' + val + ':]')
				})
				let sendmsgfu = str;
				sendmsgfu = sendmsgfu.replace(/<img(.*?)>/g, ':::#$')
				arrFace.forEach(function (val, index) {
					sendmsgfu = sendmsgfu.replace(':::#$', val);
				})
				let string = '<li class="clearfix">' +
					'<div class="clearfix">' +
					'<span class="fr monitor-icon-my-user spanImg">' +
					'</span>' +
					'<div class="fr divli">' +
					'<span class="colorBlue">我</span> <span class="fr colorBlue">' + new Date().toLocaleString() + '</span>' +
					'<p class="pStyle">' + str + '</p>' +
					'</div>' +
					'</div>' +
					'</li>'
				$('.talkContenthistory').append(string)
				$('#talkCon').html('')
				this.usermainHeight = document.getElementById('user-main').scrollHeight;
				if (this.isRobet) {
					this.robotAswer(strRobot);
				} else {
					sendTextToAgent(sendmsgfu, '', '')
				}
			},
			/* handleSendFile($event) { //文件传输
				let self = this
				console.log('hhhhhhh', event)
				if (event.target.files[0].name) {
					this.fileName = '发送文件：' + event.target.files[0].name
					$("#txt").html(event.target.files[0].name);

					//$("#sendFile").replaceWith('<input type="file" id="sendFile" name="sendFile">');
					//$('.talkContenthistory').append(string)
					sendFileToAgent('sendFile')					
				} else {
					this.$message.error('文件发送失败,请重新发送');
				}
			}, */
			robotAswer(message) {
				const self = this
				let params = {
					content: message,
					id: self.recordId,
					userId: self.recordId
				}

				this.$axios.post(webchatUri + '/queryRobotAnswer.do', Qs.stringify(params)).then(function (res) {
					console.log(res)
					if (res.status == 200 && res.data.status == '200') {
						let msg = JSON.parse(res.data.msg)
						if (msg.answerType == 0) { //机器人不理解，计数加1
							let notUnderStandCount = localStorage.getItem("notUnderStandCount");
							localStorage.setItem('notUnderStandCount', parseInt(notUnderStandCount) + 1);
						} else {
							localStorage.setItem('notUnderStandCount', '0');
						}
						if (localStorage.getItem('notUnderStandCount') == 3) { //3次不理解，自动转人工
							self.transManmade();
						}

						self.logId = msg.logId
						let answer = msg.content
						// self.historyQuestions = msg.data.historyQuestions.replace('<br>','')
						// if(msg.data.alikeQuestions){
						//     self.alikeQuestions = msg.data.alikeQuestions.split('?')
						// }

						let string = '<li class="clearfix">' +
							'<div class="clearfix">' +
							'<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">' +
							'</span>' +
							'<div class="fl divli">' +
							'<span class="colorBlue">小远</span> <span class="fr colorBlue">' + new Date().toLocaleString() + '</span>' +
							'<p class="pStyle">' + answer + '</p>' +
							'</div>' +
							'</div>' +
							'</li>'
						$('.talkContenthistory').append(string)
						$('#talkCon').html('')
						self.usermainHeight = document.getElementById('user-main').scrollHeight;

						if (msg.question != null && msg.question != '') {
							self.$axios.post(webchatUri + '/queryFaq.do', Qs.stringify({
								sendmessage: msg.question
							})).then(function (res) {
								console.info(res);
								if (res.status == '200' && res.data.status == '200') {
									let obj = JSON.parse(res.data.msg)
									console.log(obj)
									self.alikeQuestions = obj.dataList
								}
							})
						}

					}
				})


			},
			showImage(event) {
				console.info($(event.target));
			},
			transferRobet() {
				this.isRobet = true
			},
			loginOut() {
				localStorage.setItem("notUnderStandCount", '0');
				logout()
				this.$router.push('/')
			},
			staticSubmit() {
				const self = this
				let jobId = localStorage.getItem('jobId')
				console.info(jobId)
				let satisfaction = this.radio
				let desc = this.textarea2
				sendSatisfactionResult(jobId, satisfaction, desc, function (obj) {
					console.info(obj)
					if (obj.resultCode === '0') {
						self.$message({
							type: 'success',
							message: '评价成功，非常感谢'
						})
					}
					self.dialogTableVisible1 = false
				})
			},
			moreChance() {
				this.$router.push('/')
			},
			gomoreLink(item) {
				this.$router.push({
					path: '/empty',
					query: {
						id: item.id
					}
				})
			},
			answerComQuestion(item) {

				const self = this
				let params = {
					content: item.question,
					id: self.recordId,
					userId: self.recordId
				}

				this.$axios.post(webchatUri + '/queryRobotAnswer.do', Qs.stringify(params)).then(function (res) {
					console.log(res)
					if (res.status == 200 && res.data.status == '200') {
						let msg = JSON.parse(res.data.msg)
						self.logId = msg.logId
						let answer = msg.content
						// self.historyQuestions = msg.data.historyQuestions.replace('<br>','')
						// if(msg.data.alikeQuestions){
						//     self.alikeQuestions = msg.data.alikeQuestions.split('?')
						// }

						let string = '<li class="clearfix">' +
							'<div class="clearfix">' +
							'<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">' +
							'</span>' +
							'<div class="fl divli">' +
							'<span class="colorBlue">小远</span> <span class="fr colorBlue">' + new Date().toLocaleString() + '</span>' +
							'<p class="pStyle">' + answer + '</p>' +
							'</div>' +
							'</div>' +
							'</li>'
						$('.talkContenthistory').append(string)
						$('#talkCon').html('')
						self.usermainHeight = document.getElementById('user-main').scrollHeight;

					}
				})

				// let string = '<li class="clearfix">' +
				//             '<div class="clearfix">' +
				//                 '<span class="fl monitor-icon-my-omni spanImg">' +
				//                 '</span>'+
				//                 '<div class="fl divli">'+
				//                     '<span class="colorBlue">小远</span> <span class="fr colorBlue">'+new Date().toLocaleString()+'</span>'+
				//                     '<p class="pStyle">'+item.ANSWER+'</p>' +
				//                 '</div>'+
				//             '</div>'+
				//         '</li>'
				// $('.talkContenthistory').append(string)
				// $('#talkCon').html('')
				// this.usermainHeight = document.getElementById('user-main').scrollHeight;
			},
			linkQuestion(item) {
				this.robotAswer(item)
			},
			RobotSubmit() {
				const self = this
				let content = ''
				if (this.radioRobot == '1') {
					content = '非常满意'
				} else if (this.radioRobot == '2') {
					content = '满意'
				} else if (this.radioRobot == '3') {
					content = '不满意'
				} else {
					content = '很差'
				}
				let params = {
					logId: this.logId,
					content: content
				}
				this.$axios.post(webchatUri + '/satisficeSubmit.do', Qs.stringify(params)).then(function (res) {
					console.info(res);
					if (res.data.status == '200') {
						self.$message({
							type: 'success',
							message: '提交成功，非常感谢您的评价'
						})
					}
				})
			}
		},
		components: {
			vface,
			Vniuniu
		},
		created() {
			console.log('this.$route', this.$route)
			const self = this;
			this.recordId = this.getUUID().replace(/-/g, "");
			this.userName = self.getUUID().replace(/-/g, "") + "_" + self.recordId;
			this.nickName = self.getUUID().replace(/-/g, "");
			console.log('this.$route.query.channel', this.$route.query.channel);
			if (this.$route.query.channel != undefined) {
				this.isRobet = false
				this.showConnected();
				if (!this.istransferFlag) {
					let userName = self.getUUID().replace(/-/g, "") + "_" + self.recordId + "_" + self.$route.query.channel.verifCodeNumber
					let nickName = self.getUUID().replace(/-/g, "")
					let userTel = ''
					let viplevel = ''
					let deptFlag = '1'
					let dept = this.$route.query.channel.company
					let userInfo = ''
					let loginType = '0'
					console.log("userName", userName)
					console.log("recordId", self.recordId)
					console.log("dept的值是：", dept);
					login(userName, nickName, userTel, viplevel, deptFlag, dept, userInfo, loginType, function (res) {
						console.info("created 客户登录后的返回是=========", res);
						if (res.resultCode === "0") {
							setTimeout(function () {
								connectTargetAgentService(self.$route.query.channel.company + self.$route.query.channel.account, self.$route
									.query.channel.acceptedType, '', userInfo);
								self.istransferFlag = true
							}, 1000)
						} else {
							this.message({
								type: 'error',
								message: res.resultText
							})
						}
					});
				} else {
					this.$message({
						type: 'error',
						message: '正在为您转接中，请稍后....'
					})
				}
			} else {
				if (!this.$route.query.id) {
					this.$router.push('/')
				}
				this.id = this.$route.query.id
			}

			localStorage.setItem("notUnderStandCount", '0');

		},
		mounted() {
			const self = this
			window.oncusterToransfer = function (obj) {
				if (typeof obj === 'object' && obj.type === 'transferIng') {
					let str = '<li>' +
						'<p class="sysTippTag">' + obj.message + '......</p>' +
						'</li>'
					$('.talkContenthistory').append(str);
					self.usermainHeight = document.getElementById('user-main').scrollHeight;

				}
			}
			window.sendFileToAgent('sendFile')  //向坐席发送文件方法
			window.oncusterToransferFile = function (obj) {
				if (typeof obj === 'object') {
					let string = '<li class="clearfix">' +
						'<div class="clearfix">' +
						'<span class="fr monitor-icon-my-user spanImg">' +
						'</span>' +
						'<div class="fr divli">' +
						'<span class="colorBlue">我</span> <span class="fr colorBlue">' + new Date().toLocaleString() + '</span>' +
						'<p class="pStyle">' + '发送文件成功!' + '</p>' +
						'</div>' +
						'</div>' +
						'</li>'
					$('.talkContenthistory').append(string)
					self.usermainHeight = document.getElementById('user-main').scrollHeight;
				}
			}
			window.agentAccpet = function (obj) {
				self.isConnected = true; //会话建立后，隐藏转人工按钮
				if (typeof obj === 'object') {
					var r = /\[(.+?)\]/g;
					var m = r.exec(obj.content);
					let str = '<li>' +
						'<p class="sysTippTag">' + m[1] + '</p>' +
						'</li>'
					$('.talkContenthistory').append(str);
					self.usermainHeight = document.getElementById('user-main').scrollHeight;
					localStorage.setItem('jobId', obj.jobId)
					self.istransferFlag = false;
				}
			}
			window.agentTocusterMessage = function (obj) {
					if (typeof obj === 'object') {
						if (obj.state == "Administrator") {
							let str = '<li class="clearfix" style="text-align:center;">' + obj.agentNo + '</li>'
							$('.talkContenthistory').append(str);
							self.usermainHeight = document.getElementById('user-main').scrollHeight;
						} else {
							let agentNo = /.+?\:([^@]+)@.+/.exec(obj.state)[1];
							let arrFace = []
							let strr = obj.agentNo;
							strr = strr.replace(/\[:(.+?)\:]/g, ':::#$')
							arrFace = obj.agentNo.match(/[:[0-9]+:]/g)
							if (arrFace) {
								arrFace.length > 0 ? arrFace.forEach(function (val, index) {
									val = val.replace(/[^0-9]/ig, "")
									strr = strr.replace(':::#$', '<img src="static/img/face/' + val +
										'.gif" style="width:1.5rem;height:1.5rem;display:inline-block;"/>')
									arrFace[index] = val
								}) : arrFace = []
							}
							let str = '<li class="clearfix">' +
								'<div class="clearfix">' +
								'<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">' +
								'</span>' +
								'<div class="fl divli">' +
								'<span>' + agentNo + '</span> <span class="fr">' + new Date().toLocaleString() + '</span>' +
								'<p class="pStyle">' + strr + '</p>' +
								'</div>' +
								'</div>' +
								'</li>'
							$('.talkContenthistory').append(str);
							self.usermainHeight = document.getElementById('user-main').scrollHeight;
						}
					}
				},
				window.agentHangup = function (obj) {
					self.isConnected = false; //会话结束后，显示转人工按钮
					let str = ''
					if (typeof obj === 'object') {
						if (obj.content === 0) {
							str = '<li>' +
								'<p class="sysTippTag">坐席已挂断会话</p>' +
								'</li>'
						} else if (obj.content === 2) {
							str = '<li>' +
								'<p class="sysTippTag">坐席已挂断会话</p>' +
								'</li>'
						} else if (obj.content === 1) {
							str = '<li>' +
								'<p class="sysTippTag">超时挂断</p>' +
								'</li>'
						}
						$('.talkContenthistory').append(str);
						logout()
						self.isRobet = true
						self.usermainHeight = document.getElementById('user-main').scrollHeight;
						self.istransferFlag = false;
					}
				},
				window.oncusterTorobit = function (obj) {

				},
				window.custertoagentSatis = function (obj) {
					self.dialogTableVisible1 = true
					self.istransferFlag = false;
				},
				window.agenttoCusterImg = function (obj) {
					if (typeof obj === 'object') {
						let agentNo = /.+?\:([^@]+)@.+/.exec(obj.agentNo)[1];
						let str = '<li class="clearfix">' +
							'<div class="clearfix">' +
							'<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">' +
							'</span>' +
							'<div class="fl divli">' +
							'<span>' + agentNo + '</span> <span class="fr">' + new Date().toLocaleString() + '</span>' +
							'<p class="pStyle"><img style = "width:130px;height:60px" src="' + obj.content[obj.content.length - 1] +
							'" alt="" class="agentBigIMG" data-id="' + obj.content[0] + '"/></p>' +
							'</div>' +
							'</div>' +
							'</li>'
						$('.talkContenthistory').append(str);

						$('.pStyle img.agentBigIMG').on('click', function (event) {
							console.log(event)
							self.dialogTableVisible = true;
							self.imgurl = $(event.target).context.dataset.id;
						})
						self.$nextTick(function () {
							self.usermainHeight = document.getElementById('user-main').scrollHeight;
						})
					}
				},
				window.agentToCusterFile = function (obj) {
					if (typeof obj === 'object') {
						let agentNo = /.+?\:([^@]+)@.+/.exec(obj.agentNo)[1];
						let str = '<li class="clearfix">' +
							'<div class="clearfix">' +
							'<img src="../../static/img/agentImg.png" alt="" class="agentImg fl">' +
							'</span>' +
							'<div class="fl divli">' +
							'<span>' + agentNo + '</span> <span class="fr">' + new Date().toLocaleString() + '</span>' +
							'<p class="pStyle">发送文件：   ' + obj.fileName + '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="myfile" data-url=' + obj.downLoad_url +
							'>下载</span></p>' +
							'</div>' +
							'</div>' +
							'</li>'
            $('.talkContenthistory').append(str);
            $('.pStyle span.myfile').on('click', function (event) {
							console.log(event)
							window.open(event.target.dataset.url);
						})
						self.$nextTick(function () {
							self.usermainHeight = document.getElementById('user-main').scrollHeight;
						})
					}
				}
			window.robotIsalink = function (obj) {
				self.robotAswer(obj.message)
			}
			window.comeFromSystemMessage = function (obj) {
				let agentNo = /.+?\:([^@]+)@.+/.exec(obj.agentNo)[1];
				let str = '<li class="clearfix">' +
					message +
					'</li>'
				$('.talkContenthistory').append(str);
				self.$nextTick(function () {
					self.usermainHeight = document.getElementById('user-main').scrollHeight;
				})
			}
			window.onbeforeunload = function () {
				logout()
			}
			let params = {
				id: this.id
			}
			this.$axios.post(webchatUri + '/queue/queryQueueById.do', Qs.stringify(params)).then(function (res) {
				if (res.status === 200 && res.data.status === '200') {
						let obj = res.data.obj
						self.contentone = obj.contentone
						self.contenttwo = obj.contenttwo
						self.welcomes = obj.welcomes
						self.queue = obj.queue
						self.deptId = obj.deptId
				}
			})
			this.$axios.post(webchatUri + '/indexConfig/queryIndexConfig.do').then(function (res) {
				if (res.status === 200 && res.data.status === '200') {
					let obj = res.data.obj
					self.queueGroups = obj.queueGroups
					obj.logouri ? self.logouri = obj.logouri : ''
				}
			})
			let sendParam = {
				channelType: 0, //0为全渠道,1为webchat，2为语音，3为微信，4为app,5为QQ
				days: 30,
				topSize: 10
			}
			this.$axios.post(webchatUri + '/questionCommon.do', Qs.stringify(sendParam)).then(function (res) {
				//旧接口和参数：queryFaq.do   {sendmessage: "西湖卡"}
				console.info(res);
				if (res.status == '200' && res.data.status == '200') {
					let obj = JSON.parse(res.data.msg)
					self.normalQuestion = obj.dataList
				}
			})


			function loadjs() {
				return new Promise(function (resolve, reject) {

				})
			}
		},
		watch: {
			usermainHeight: { //把滚动条固定于val底部
				handler: (val, oldval) => {
					document.getElementById('user-main').scrollTop = document.getElementById('user-main').scrollHeight;
				},
				deep: true
			}
		}
	}
</script>
