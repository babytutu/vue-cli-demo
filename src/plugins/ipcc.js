function onAgentAckEvent(agentNo, content, jobId, userId) {
  console.info(agentNo, content, jobId, userId)
  if (typeof window.agentAccpet === 'function') {
    window.agentAccpet({
      'agentNo': agentNo,
      'content': content,
      'jobId': jobId,
      'userId': userId
    })
  }
}

function onAgentToUserTextEvent(number, content) {
  console.info(content)
  if (typeof window.agentTocusterMessage === 'function') {
    window.agentTocusterMessage({number, content})
  }
}

function onAgentToUserPicEvent(agentNo, content) {
  console.info(agentNo, content);
  if (typeof window.agenttoCusterImg === 'function') {
    window.agenttoCusterImg({
      'agentNo': agentNo,
      'content': content
    })
  }
}

function onAgentToUserFileEvent(agentNo, fileName, downLoad_url) {
  console.info(agentNo, fileName, downLoad_url)
  if (typeof window.agentToCusterFile === 'function') {
    window.agentToCusterFile({
      'agentNo': agentNo,
      'fileName': fileName,
      'downLoad_url': downLoad_url
    })
  }
}

function onAgentToUserSatisEvent(agentNo, fileName, downLoad_url) { // 满意度推送
  console.info(agentNo, fileName, downLoad_url);
  if (typeof window.custertoagentSatis === 'function') {
    window.custertoagentSatis({
      'agentNo': agentNo,
      'fileName': fileName,
      'downLoad_url': downLoad_url
    })
  }
}

function onAgentHangUpEvent(content) {
  console.log(content)
  if (typeof window.agentHangup === 'function') {
    window.agentHangup({
      'content': content
    })
  }
}

function onDisConnectionEvent(type) {
  console.info(type);
}

function onAgentServiceBack(resultCode, resultText) {
  console.log(resultText)
  if (resultCode === 0) {
    if (typeof window.oncusterToransfer === 'function') {
      window.oncusterToransfer({
        message: '正在为您转接，请稍后',
        type: 'transferIng'
      })
    }
  }
}

function onSendTextBack(resultCode, resultText) {
  console.info(resultCode, resultText)
}

function onSendPicBack(resultCode, resultText, picUrl) {
  console.info(resultCode, resultText, picUrl)
}

function onSendFileBack(resultCode, resultText, fileUrl) {
  console.info(resultCode, resultText, fileUrl)
  if (resultCode === 0) {
    if (typeof window.oncusterToransferFile === 'function') {
      window.oncusterToransferFile({
        url: fileUrl
      })
    }
  }
}

function onDisconnectSeatLink(resultCode, resultText) {
  console.log(resultCode, resultText)
}

function onRobbotAnswer(resultCode, resultText) {
  console.info(resultCode, resultText);
  // if (typeof window.oncusterTorobit === 'function') {

  // }
}

function setQuestion(event) {
  console.info(event)
  if (typeof window.robotIsalink === 'function') {
    window.robotIsalink({
      message: event
    })
  }
}

export default {
  onAgentAckEvent,
  onAgentHangUpEvent,
  onAgentServiceBack,
  onAgentToUserFileEvent,
  onAgentToUserTextEvent,
  onAgentToUserSatisEvent,
  onAgentToUserPicEvent,
  onRobbotAnswer,
  setQuestion,
  onDisconnectSeatLink,
  onDisConnectionEvent,
  onSendFileBack,
  onSendTextBack,
  onSendPicBack,
}