<template>
  <div class="i18n-test">
    <h3>国际化测试组件 (Composition API)</h3>
    
    <!-- 使用模板中的$t (全局注入) -->
    <div class="test-section">
      <h4>模板中使用 $t (全局注入):</h4>
      <p>系统名称: {{ $t('common.systemName') }}</p>
      <p>确定按钮: {{ $t('common.confirm') }}</p>
      <p>取消按钮: {{ $t('common.cancel') }}</p>
    </div>

    <!-- 使用Composition API中的t函数 -->
    <div class="test-section">
      <h4>Composition API中使用 t 函数:</h4>
      <p>系统名称: {{ systemName }}</p>
      <p>确定按钮: {{ confirmText }}</p>
      <p>取消按钮: {{ cancelText }}</p>
    </div>

    <!-- 当前语言信息 -->
    <div class="test-section">
      <h4>当前语言信息:</h4>
      <p>当前语言: {{ currentLocale }}</p>
      <p>可用语言: {{ availableLocales.join(', ') }}</p>
    </div>

    <!-- 语言切换测试 -->
    <div class="test-section">
      <h4>语言切换测试:</h4>
      <el-button @click="switchToZhCN">切换到中文</el-button>
      <el-button @click="switchToEnUS">Switch to English</el-button>
    </div>

    <!-- 响应式翻译测试 -->
    <div class="test-section">
      <h4>响应式翻译测试:</h4>
      <p>动态翻译: {{ dynamicTranslation }}</p>
      <el-button @click="toggleTranslationKey">切换翻译键</el-button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale, getCurrentLocale } from '../i18n'

export default {
  name: 'I18nTest',
  setup() {
    // 使用Composition API的useI18n
    const { t, locale, availableLocales } = useI18n()
    
    // 响应式数据
    const currentTranslationKey = ref('common.systemName')
    
    // 计算属性 - 使用t函数进行翻译
    const systemName = computed(() => t('common.systemName'))
    const confirmText = computed(() => t('common.confirm'))
    const cancelText = computed(() => t('common.cancel'))
    
    // 当前语言
    const currentLocale = computed(() => locale.value)
    
    // 动态翻译
    const dynamicTranslation = computed(() => t(currentTranslationKey.value))
    
    // 方法
    const switchToZhCN = () => {
      setLocale('zh-CN')
    }
    
    const switchToEnUS = () => {
      setLocale('en-US')
    }
    
    const toggleTranslationKey = () => {
      currentTranslationKey.value = currentTranslationKey.value === 'common.systemName' 
        ? 'common.confirm' 
        : 'common.systemName'
    }
    
    // 监听语言变化
    watch(locale, (newLocale) => {
      console.log('语言已切换到:', newLocale)
    })
    
    return {
      // 响应式数据
      currentTranslationKey,
      
      // 计算属性
      systemName,
      confirmText,
      cancelText,
      currentLocale,
      availableLocales,
      dynamicTranslation,
      
      // 方法
      switchToZhCN,
      switchToEnUS,
      toggleTranslationKey
    }
  }
}
</script>

<style scoped>
.i18n-test {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.test-section h4 {
  margin-top: 0;
  color: #333;
}

.test-section p {
  margin: 5px 0;
}

.el-button {
  margin-right: 10px;
}
</style>
