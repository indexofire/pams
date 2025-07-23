# Vue I18n Composition API 使用指南

## 概述

本项目已从 Vue I18n Legacy API 模式转换为 Composition API 模式，以获得更好的 TypeScript 支持、性能和与 Vue 3 的一致性。

## 配置变更

### 之前 (Legacy API)
```javascript
const i18n = createI18n({
  legacy: true,
  locale: 'zh-CN',
  messages
})
```

### 现在 (Composition API)
```javascript
const i18n = createI18n({
  legacy: false,  // 启用 Composition API
  locale: 'zh-CN',
  messages,
  globalInjection: true  // 保持模板中 $t 的兼容性
})
```

## 使用方式

### 1. 在模板中使用 (推荐，兼容性最好)

```vue
<template>
  <div>
    <h1>{{ $t('common.systemName') }}</h1>
    <button>{{ $t('common.confirm') }}</button>
  </div>
</template>
```

### 2. 在 Composition API 中使用 (推荐新代码)

```vue
<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t, locale } = useI18n()
    
    // 基本翻译
    const title = computed(() => t('common.systemName'))
    
    // 带参数的翻译
    const message = computed(() => t('messages.welcome', { name: 'User' }))
    
    // 当前语言
    const currentLang = computed(() => locale.value)
    
    return {
      title,
      message,
      currentLang
    }
  }
}
</script>
```

### 3. 在 Options API 中使用 (兼容旧代码)

```vue
<script>
export default {
  computed: {
    title() {
      return this.$t('common.systemName')
    }
  },
  methods: {
    showMessage() {
      this.$message.success(this.$t('messages.success'))
    }
  }
}
</script>
```

## 语言切换

### 使用提供的工具函数

```javascript
import { setLocale, getCurrentLocale } from '@/i18n'

// 临时切换语言（不保存到系统设置）
setLocale('en-US')

// 获取当前语言
const current = getCurrentLocale()
```

### 在组件中监听语言变化

```javascript
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { locale } = useI18n()
    
    // 监听语言变化
    watch(locale, (newLocale) => {
      console.log('语言已切换到:', newLocale)
      // 执行语言切换后的逻辑
    })
    
    return {}
  }
}
```

## 高级用法

### 1. 条件翻译

```javascript
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()
    
    const statusText = computed(() => {
      const status = 'active' // 来自数据
      return t(`status.${status}`)
    })
    
    return { statusText }
  }
}
```

### 2. 复数形式

```javascript
const { t } = useI18n()

// 语言文件中定义
// messages: {
//   'zh-CN': {
//     items: '{count} 个项目 | {count} 个项目'
//   },
//   'en-US': {
//     items: 'no items | one item | {count} items'
//   }
// }

const itemCount = computed(() => t('items', count.value))
```

### 3. 日期和数字格式化

```javascript
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { n, d } = useI18n()
    
    const formattedNumber = computed(() => n(1234.56, 'currency'))
    const formattedDate = computed(() => d(new Date(), 'short'))
    
    return {
      formattedNumber,
      formattedDate
    }
  }
}
```

## 最佳实践

### 1. 翻译键命名规范

```javascript
// 推荐的命名结构
{
  common: {
    systemName: '系统名称',
    buttons: {
      save: '保存',
      cancel: '取消'
    }
  },
  pages: {
    dashboard: {
      title: '仪表板',
      welcome: '欢迎使用'
    }
  },
  messages: {
    success: '操作成功',
    error: '操作失败'
  }
}
```

### 2. 组件中的使用模式

```vue
<template>
  <div>
    <!-- 简单翻译 -->
    <h1>{{ $t('pages.dashboard.title') }}</h1>
    
    <!-- 动态翻译 -->
    <p>{{ welcomeMessage }}</p>
    
    <!-- 带参数翻译 -->
    <span>{{ $t('messages.itemCount', { count: items.length }) }}</span>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export default {
  setup() {
    const { t } = useI18n()
    
    const welcomeMessage = computed(() => 
      t('pages.dashboard.welcome', { name: user.value.name })
    )
    
    return {
      welcomeMessage
    }
  }
}
</script>
```

### 3. 错误处理

```javascript
import { hasTranslation, safeTranslate } from '@/i18n'

// 检查翻译键是否存在
if (hasTranslation('some.key')) {
  const text = t('some.key')
}

// 安全翻译（键不存在时返回键本身）
const text = safeTranslate('some.key', {}, 'zh-CN')
```

## 迁移指南

### 从 Legacy API 迁移

1. **模板代码**：无需修改，`$t()` 继续工作
2. **Options API**：无需修改，`this.$t()` 继续工作
3. **新的 Composition API 组件**：使用 `useI18n()`

### 推荐的迁移策略

1. 保持现有代码不变
2. 新组件使用 Composition API 方式
3. 重构时逐步迁移到 Composition API

## 性能优化

### 1. 避免在模板中使用复杂表达式

```vue
<!-- 不推荐 -->
<template>
  <div>{{ $t(getTranslationKey()) }}</div>
</template>

<!-- 推荐 -->
<template>
  <div>{{ translatedText }}</div>
</template>

<script>
export default {
  setup() {
    const { t } = useI18n()
    
    const translatedText = computed(() => t(getTranslationKey()))
    
    return { translatedText }
  }
}
</script>
```

### 2. 使用计算属性缓存翻译结果

```javascript
const { t } = useI18n()

// 推荐：使用计算属性
const title = computed(() => t('common.title'))

// 不推荐：每次都调用
const getTitle = () => t('common.title')
```

## 故障排除

### 常见问题

1. **翻译不更新**：确保使用 `computed()` 包装翻译调用
2. **TypeScript 错误**：确保正确导入 `useI18n` 类型
3. **语言切换无效**：检查是否正确使用 `setLocale()` 函数

### 调试技巧

```javascript
// 启用调试模式
const { t, locale, messages } = useI18n()

console.log('当前语言:', locale.value)
console.log('可用翻译:', messages.value[locale.value])
console.log('翻译结果:', t('some.key'))
```
