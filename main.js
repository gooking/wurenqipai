import App from './App'
import WXAPI from 'apifm-uniapp'

import Vue from 'vue'
import './uni.promisify.adaptor'
import store from './store'

Vue.prototype.$store = store
Vue.prototype.$wxapi = WXAPI
Vue.config.productionTip = false
App.mpType = 'app'

// 引入uView提供的对vuex的简写法文件
let vuexStore = require('@/store/$u.mixin.js');
Vue.mixin(vuexStore);


const app = new Vue({
	store,
  ...App
})
app.$mount()