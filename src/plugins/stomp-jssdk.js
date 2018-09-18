/**
 * 获取响应
 */
function responseCallback(frame) {
  console.log('responseCallback msg=>' + frame.body)
}
/**
 * 建立stomp链接
 */
function connect() {
  this.client = Stomp.client(this.wsUrl)
  var headers = {
    // 'login': '0324',
    // 'passcode': '0324',
    // 'client-id': 'clientid'
    // additional header
  }
  this.client.connect(headers, this.onConnected, this.onFailed)
}
/**
 * 订阅
 */
function onConnected(frame) {
  console.log('Connected: ' + frame)
  this.client.subscribe(this.topic, this.responseCallback, this.onFailed)
}
/**
 * 连接失败
 */
function onFailed(frame) {
  console.log('Failed: ' + frame)
}