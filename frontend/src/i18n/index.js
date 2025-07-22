import { createI18n } from 'vue-i18n'
import zhCN from '../locales/zh-CN.js'
import enUS from '../locales/en-US.js'

// 获取系统设置中的语言配置
export function getSystemLanguageSetting () {
  try {
    const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}')
    const language = systemSettings.language || 'auto'
    // 确保返回的值是有效的
    if (language === 'zh-CN' || language === 'en-US' || language === 'auto') {
      return language
    }
    return 'auto' // 如果值无效，返回auto
  } catch (error) {
    console.error('[getSystemLanguageSetting] Error:', error)
    return 'auto'
  }
}

// 获取浏览器语言
function getBrowserLanguage () {
  try {
    const browserLang = navigator.language || navigator.userLanguage || 'zh-CN'
    if (browserLang.startsWith('zh')) {
      return 'zh-CN'
    } else if (browserLang.startsWith('en')) {
      return 'en-US'
    }
    return 'zh-CN' // 默认中文
  } catch (error) {
    console.error('[getBrowserLanguage] Error:', error)
    return 'zh-CN' // 出错时默认中文
  }
}

// 获取默认语言设置
function getDefaultLocale () {
  try {
    // 1. 首先检查系统设置中的语言配置
    const systemLang = getSystemLanguageSetting()

    // 确保systemLang是有效的值
    if (systemLang === 'zh-CN' || systemLang === 'en-US') {
      return systemLang
    }

    // 2. 如果系统设置为"自动"，检查localStorage中临时保存的语言设置
    const tempLocale = localStorage.getItem('pams-temp-locale')
    if (tempLocale && (tempLocale === 'zh-CN' || tempLocale === 'en-US')) {
      return tempLocale
    }

    // 3. 如果系统设置为"自动"，根据浏览器语言决定
    if (systemLang === 'auto') {
      const browserLang = getBrowserLanguage()
      // 确保browserLang是有效的值
      if (browserLang === 'zh-CN' || browserLang === 'en-US') {
        return browserLang
      }
    }

    // 4. 默认使用中文
    return 'zh-CN'
  } catch (error) {
    console.error('[getDefaultLocale] Error:', error)
    // 出错时默认使用中文
    return 'zh-CN'
  }
}

const messages = {
  'zh-CN': zhCN,
  'en-US': enUS
}

const defaultLocale = getDefaultLocale()

// 确保locale值有效
const validLocale = (defaultLocale === 'zh-CN' || defaultLocale === 'en-US') ? defaultLocale : 'zh-CN'

const i18n = createI18n({
  legacy: true, // 使用 Legacy API 模式
  locale: validLocale, // 使用验证过的locale
  fallbackLocale: 'zh-CN', // 回退语言
  messages,
  globalInjection: true, // 全局注入，支持在模板中使用 $t
  silentTranslationWarn: false, // 显示翻译警告，帮助发现缺失的键
  silentFallbackWarn: false, // 显示回退警告
  missingWarn: true, // 显示缺失键警告
  fallbackWarn: true // 显示回退警告
})

// 切换语言的函数（临时切换，不保存到系统设置）
export function setLocale (locale) {
  // 设置i18n的locale (Legacy API模式)
  i18n.global.locale = locale

  // 临时保存到localStorage（不影响系统设置）
  localStorage.setItem('pams-temp-locale', locale)

  // 更新HTML的lang属性
  document.documentElement.setAttribute('lang', locale)
}

// 永久设置语言（保存到系统设置）
export function setSystemLocale (locale) {
  // 更新系统设置
  const systemSettings = JSON.parse(localStorage.getItem('systemSettings') || '{}')
  systemSettings.language = locale
  localStorage.setItem('systemSettings', JSON.stringify(systemSettings))

  // 清除临时语言设置
  localStorage.removeItem('pams-temp-locale')

  // 确定实际使用的语言
  let actualLocale = locale
  if (locale === 'auto') {
    actualLocale = getBrowserLanguage()
  }

  // 设置当前语言
  i18n.global.locale.value = actualLocale
  document.documentElement.setAttribute('lang', actualLocale)

  return actualLocale
}

// 获取当前语言
export function getCurrentLocale () {
  return i18n.global.locale.value // Composition API模式下访问.value
}

// 获取支持的语言列表
export function getSupportedLocales () {
  return [
    { value: 'auto', label: '自动' },
    { value: 'zh-CN', label: '中文' },
    { value: 'en-US', label: 'English' }
  ]
}

// 获取系统语言设置选项（用于系统设置页面）
export function getSystemLanguageOptions () {
  return [
    { value: 'auto', label: '自动检测' },
    { value: 'zh-CN', label: '中文（简体）' },
    { value: 'en-US', label: 'English (US)' }
  ]
}

// 重新初始化语言（用于系统设置更改后）
export function reinitializeLocale () {
  const newLocale = getDefaultLocale()
  i18n.global.locale.value = newLocale
  document.documentElement.setAttribute('lang', newLocale)
  return newLocale
}

// 检查翻译键是否存在
export function hasTranslation (key, locale = null) {
  const targetLocale = locale || getCurrentLocale()
  const message = i18n.global.messages.value[targetLocale]

  // 支持嵌套键检查，如 'common.systemName'
  const keys = key.split('.')
  let current = message

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k]
    } else {
      return false
    }
  }

  return current !== undefined && current !== null
}

// 安全的翻译函数，如果键不存在则返回键本身
export function safeTranslate (key, params = {}, locale = null) {
  if (hasTranslation(key, locale)) {
    return i18n.global.t(key, params, { locale })
  } else {
    console.warn(`[i18n] Translation key '${key}' not found in locale '${locale || getCurrentLocale()}'`)
    return key
  }
}

export default i18n
