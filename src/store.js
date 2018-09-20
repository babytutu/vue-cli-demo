import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    list: []
  },
  mutations: {
    increment (state, data) {
      state.list.push(data)
    }
  },
  actions: {

  }
})
