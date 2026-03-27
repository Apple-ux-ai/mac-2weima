import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import './styles/rtl.css'
import { initToastReplacements } from './utils/toast.js'
import { i18n } from './i18n'

// 初始化自定义弹窗替换原生alert和confirm
initToastReplacements()

createApp(App).use(i18n).mount('#app')





















