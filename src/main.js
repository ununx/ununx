import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import store from './store'
import VueI18n from 'vue-i18n'
import router from './router'

// import VConsole from 'vconsole' // 移动端console显示
// Vue.prototype.$vconsole = new VConsole()

Vue.config.productionTip = false //阻止生产环境过多提示消息；

Vue.use(VueI18n) // 通过插件的形式挂载多语言组件
const i18n = new VueI18n({
  locale: localStorage.getItem('lang') || 'en', // 语言标识 默认en
  messages: {
    cn: require('./lang/zh'), // 中文语言包
    en: require('./lang/en') // 英文语言包
  }
})

new Vue({
  vuetify,
  router,
  store,
  i18n,  // 不要忘记
  render: h => h(App)
}).$mount('#app')
