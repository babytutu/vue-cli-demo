import Vue from 'vue'
import 'normalize.css'
import './plugins/axios'
import './plugins/responsive'
import App from './App.vue'
import router from './router'

import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import '@/assets/reset.styl'
import store from './store'

Vue.config.productionTip = false

Vue.use(MintUI)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
