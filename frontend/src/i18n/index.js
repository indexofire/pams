import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN.js'
import enUS from '../locales/en-US.js'

// 获取浏览器语言设置
function getDefaultLocale () {
  // 首先检查localStorage中是否有保存的语言设置
  const savedLocale = localStorage.getItem('pams-locale')
  if (savedLocale) {
    return savedLocale
  }

  // 获取浏览器语言
  const browserLocale = navigator.language || navigator.userLanguage

  // 根据浏览器语言返回对应的locale
  if (browserLocale.startsWith('zh')) {
    return 'zh-CN'
  } else {
    return 'en-US'
  }
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(), // 默认语言
  fallbackLocale: 'zh-CN', // 回退语言
  messages,
  globalInjection: true // 全局注入 $t 函数
})

// 切换语言的函数
export function setLocale (locale) {
  i18n.global.locale.value = locale
  localStorage.setItem('pams-locale', locale)

  // 更新HTML的lang属性
  document.documentElement.setAttribute('lang', locale)
}

// 获取当前语言
export function getCurrentLocale () {
  return i18n.global.locale.value
}

// 获取支持的语言列表
export function getSupportedLocales () {
  return [
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' }
  ]
}

export default i18n
