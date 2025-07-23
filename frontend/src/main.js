import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 权限控制
import permissionDirectives from './directives/permission'
import { createPermissionGuard } from './router/permission'

// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'

// 第三方图标库
import { FontAwesomeIcon } from './plugins/icons'

// 国际化
import i18n from './i18n'

// 用户数据迁移
import { migrateUserData, needsMigration } from './utils/migrateUserData'

// ECharts
import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreeChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent
} from 'echarts/components'

// 全面的ResizeObserver错误拦截
const originalError = console.error
console.error = (...args) => {
  // 只拦截ResizeObserver相关错误，其他错误正常显示
  const errorMessage = String(args[0] || '')
  if (errorMessage.includes('ResizeObserver loop completed') ||
      errorMessage.includes('ResizeObserver loop limit exceeded')) {
    return // 静默忽略ResizeObserver错误
  }
  originalError.apply(console, args)
}

// 拦截全局错误事件
window.addEventListener('error', (e) => {
  if (e.message && (
    e.message.includes('ResizeObserver loop completed') ||
    e.message.includes('ResizeObserver loop limit exceeded')
  )) {
    e.stopImmediatePropagation()
    e.preventDefault()
    return false
  }
})

// 拦截未处理的Promise错误
window.addEventListener('unhandledrejection', (e) => {
  if (e.reason && (
    String(e.reason).includes('ResizeObserver loop completed') ||
    String(e.reason).includes('ResizeObserver loop limit exceeded')
  )) {
    e.preventDefault()
    return false
  }
})

// 拦截webpack-dev-server的错误覆盖层
if (process.env.NODE_ENV === 'development') {
  const originalCreateElement = document.createElement
  document.createElement = function (tagName) {
    const element = originalCreateElement.call(this, tagName)
    if (tagName === 'div' && element.id === 'webpack-dev-server-client-overlay') {
      // 监听覆盖层内容变化
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            const overlay = document.getElementById('webpack-dev-server-client-overlay')
            if (overlay && overlay.textContent) {
              const content = overlay.textContent
              if (content.includes('ResizeObserver loop completed') ||
                  content.includes('ResizeObserver loop limit exceeded')) {
                overlay.style.display = 'none'
              }
            }
          }
        })
      })
      observer.observe(element, { childList: true, subtree: true })
    }
    return element
  }
}

// 注册ECharts组件
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  TreeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  DataZoomComponent
])

// 创建应用实例
const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册Font Awesome图标
app.component('font-awesome-icon', FontAwesomeIcon)

// 注册ECharts组件
app.component('v-chart', ECharts)

// 注册权限指令
Object.keys(permissionDirectives).forEach(key => {
  app.directive(key, permissionDirectives[key])
})

// 获取Element Plus语言包
const getElementPlusLocale = (locale) => {
  return locale === 'zh-CN' ? zhCn : en
}

// 使用插件
app.use(store)
app.use(router)
app.use(ElementPlus, {
  locale: getElementPlusLocale(i18n.global.locale.value)
})
app.use(i18n)

// 设置路由权限守卫
createPermissionGuard(router)

// 执行用户数据迁移
if (needsMigration()) {
  console.log('检测到需要迁移的用户数据，开始迁移...')
  const migrationResult = migrateUserData()
  if (migrationResult.success) {
    console.log('用户数据迁移成功')
  } else {
    console.error('用户数据迁移失败:', migrationResult.error)
  }
}

// 挂载应用
app.mount('#app')
