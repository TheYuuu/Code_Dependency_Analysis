import Vue from 'vue'
import App from './App.vue'
// import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

import VueCodemirror from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
Vue.use(VueCodemirror)

Vue.config.productionTip = false

var eventBus = {
  install(Vue, options) {
    Vue.prototype.$bus = new Vue()
  }
};
Vue.use(eventBus);

new Vue({
  // router,
  store,
  render: h => h(App)
}).$mount('#app')
