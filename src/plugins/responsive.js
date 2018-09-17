/**
 * rem响应式方案的实现
 */
const win = global
const doc = win.document
const baseWidth = 750
const documentHTML = doc.documentElement

/**
 * 设置html根字体
 */
function setRootFont() {
  const docWidth = documentHTML.getBoundingClientRect().width
  const scale = docWidth / baseWidth
  documentHTML.style.fontSize = `${scale * 100}px`
}

setRootFont()
win.addEventListener('resize', setRootFont, false)
