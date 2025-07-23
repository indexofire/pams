<template>
  <div id="app">
    <div v-if="!isAuthenticated">
      <router-view />
    </div>
    <el-container v-else class="app-container">
      <!-- 侧边栏 -->
      <el-aside width="200px" class="sidebar">
        <div class="logo">
          <h2>PAMS</h2>
          <p>{{ $t('common.systemName') }}</p>
        </div>
        <el-menu
          :default-active="$route.path"
          class="sidebar-menu"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>{{ $t('nav.dashboard') }}</span>
          </el-menu-item>
          <el-menu-item index="/strains">
            <el-icon><Grid /></el-icon>
            <span>{{ $t('nav.strains') }}</span>
          </el-menu-item>
          <el-menu-item index="/strain-analysis">
            <el-icon><TrendCharts /></el-icon>
            <span>{{ $t('nav.strainAnalysis') }}</span>
          </el-menu-item>
          <el-menu-item index="/genomes">
            <el-icon><Document /></el-icon>
            <span>{{ $t('nav.genomes') }}</span>
          </el-menu-item>
          <el-sub-menu index="analysis">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>{{ $t('nav.analysis') }}</span>
            </template>
            <el-menu-item index="/analysis/annotation">{{ $t('nav.annotation') }}</el-menu-item>
            <el-menu-item index="/analysis/mlst">{{ $t('nav.mlst') }}</el-menu-item>
            <el-menu-item index="/analysis/resistance">{{ $t('nav.resistance') }}</el-menu-item>
            <el-menu-item index="/analysis/virulence">{{ $t('nav.virulence') }}</el-menu-item>
            <el-menu-item index="/analysis/phylogeny">{{ $t('nav.phylogeny') }}</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/reports">
            <el-icon><Document /></el-icon>
            <span>{{ $t('nav.reports') }}</span>
          </el-menu-item>
          <el-sub-menu index="admin" v-if="isAdmin">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>{{ $t('nav.systemManagement') }}</span>
            </template>
            <el-menu-item index="/admin/system-settings">{{ $t('nav.systemSettings') }}</el-menu-item>
            <el-menu-item index="/admin/experiment-settings">{{ $t('nav.experimentSettings') }}</el-menu-item>
            <el-menu-item index="/admin/security-audit">{{ $t('nav.securityAudit') }}</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区域 -->
      <el-container>
        <!-- 头部 -->
        <el-header class="header">
          <div class="header-content">
            <div class="header-left">
              <el-breadcrumb separator="/">
                <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="item.path">
                  {{ item.name }}
                </el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <el-badge :value="12" class="notification-badge">
                <el-icon size="20"><Bell /></el-icon>
              </el-badge>
              <LanguageSwitcher class="language-switcher" />
              <el-dropdown>
                <span class="user-info">
                  <el-icon><User /></el-icon>
                  {{ user.username }}
                  <el-tag v-if="user.role === 'admin'" type="danger" size="small">管理员</el-tag>
                  <el-tag v-else-if="user.role === 'advanced'" type="warning" size="small">高级用户</el-tag>
                  <el-tag v-else type="info" size="small">普通用户</el-tag>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToSettings">{{ $t('common.settings') }}</el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">{{ $t('nav.logout') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </el-header>

        <!-- 主内容 -->
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    LanguageSwitcher
  },
  setup () {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const { t } = useI18n()

    // 在应用启动时加载系统配置
    onMounted(async () => {
      try {
        await store.dispatch('loadSystemConfig')
      } catch (error) {
        console.error('加载系统配置失败:', error)
      }
    })

    const breadcrumbItems = computed(() => {
      const matched = route.matched.filter(item => item.meta && item.meta.title)
      return matched.map(item => ({
        path: item.path,
        name: item.meta.title
      }))
    })

    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
    const user = computed(() => store.getters['auth/user'] || {})
    const isAdmin = computed(() => store.getters['auth/isAdmin'])

    const goToSettings = () => {
      router.push('/settings')
    }

    const handleLogout = async () => {
      try {
        await store.dispatch('auth/logout')
        ElMessage.success(t('messages.logoutSuccess'))
        router.push('/login')
      } catch (error) {
        ElMessage.error(t('messages.logoutFailed'))
      }
    }

    return {
      breadcrumbItems,
      isAuthenticated,
      user,
      isAdmin,
      goToSettings,
      handleLogout
    }
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
}

#app {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  height: 100vh;
  margin: 0;
}

.app-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  color: white;
  overflow: hidden;

  .logo {
    padding: 20px;
    text-align: center;
    border-bottom: 1px solid #434a50;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
    }

    p {
      margin: 5px 0 0 0;
      font-size: 12px;
      color: #bfcbd9;
    }
  }

  .sidebar-menu {
    border-right: none;
  }
}

.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .notification-badge {
        cursor: pointer;
      }

      .language-switcher {
        margin-right: 10px;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
      }
    }
  }
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

// 覆盖Element Plus的默认按钮间距
.el-button + .el-button {
  margin-left: 8px !important;
}
</style>
