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
import { computed } from 'vue'
import { getCurrentLocale, getSupportedLocales, setLocale } from '../i18n'
import { ArrowDown } from '@element-plus/icons-vue'

export default {
  name: 'LanguageSwitcher',
  components: {
    ArrowDown
  },
  setup () {
    const currentLocale = computed(() => getCurrentLocale())
    const supportedLocales = getSupportedLocales()

    const currentLocaleLabel = computed(() => {
      const locale = supportedLocales.find(l => l.value === currentLocale.value)
      return locale ? locale.label : ''
    })

    const handleCommand = (command) => {
      setLocale(command)
    }

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
