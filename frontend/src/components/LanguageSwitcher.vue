<template>
  <el-dropdown @command="handleCommand" trigger="click">
    <span class="language-dropdown-link">
      {{ currentLocaleLabel }}
      <el-icon class="el-icon--right">
        <arrow-down />
      </el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="locale in supportedLocales"
          :key="locale.value"
          :command="locale.value"
          :disabled="locale.value === currentLocale"
        >
          {{ locale.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getCurrentLocale, getSupportedLocales, setLocale } from '../i18n'
import { ArrowDown } from '@element-plus/icons-vue'

export default {
  name: 'LanguageSwitcher',
  components: {
    ArrowDown
  },
  setup () {
    const { locale } = useI18n()
    const currentLocale = ref(getCurrentLocale())
    // 过滤掉'auto'选项，只显示具体语言
    const supportedLocales = getSupportedLocales().filter(l => l.value !== 'auto')

    const currentLocaleLabel = computed(() => {
      const localeObj = supportedLocales.find(l => l.value === currentLocale.value)
      return localeObj ? localeObj.label : ''
    })

    const handleCommand = (command) => {
      setLocale(command)
      currentLocale.value = command
    }

    // 监听语言变化
    watch(() => locale.value, (newLocale) => {
      currentLocale.value = newLocale
    })

    return {
      currentLocale,
      supportedLocales,
      currentLocaleLabel,
      handleCommand
    }
  }
}
</script>

<style scoped>
.language-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 14px;
}

.language-dropdown-link:hover {
  color: #409EFF;
}
</style>
