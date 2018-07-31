import Vue from 'vue'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'
import router from './router'
import store from './store'

import i18n from './lang' // Internationalization
import '@/icons' // icon
import '@/permission' // permission control
import '@/directive/tableLoadmore' // 表格懒加载自定义指令

import * as filters from './filters' // global filters

import VueBus from 'vue-bus'; // 一个 Vue.js 事件中心插件

Vue.use(VueBus);

Vue.use(ElementUI, {
  i18n: (key, value) => i18n.t(key, value) // ElementUI 自带国际化
})

// register global utility filters.
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App)
})
