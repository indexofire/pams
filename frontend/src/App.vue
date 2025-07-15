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
          <p>细菌基因组管理</p>
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
            <span>仪表板</span>
          </el-menu-item>
          <el-menu-item index="/strains">
            <el-icon><Grid /></el-icon>
            <span>菌株管理</span>
          </el-menu-item>
          <el-menu-item index="/strain-analysis">
            <el-icon><TrendCharts /></el-icon>
            <span>菌株筛选分析</span>
          </el-menu-item>
          <el-menu-item index="/genomes">
            <el-icon><Document /></el-icon>
            <span>基因组数据</span>
          </el-menu-item>
          <el-sub-menu index="analysis">
            <template #title>
              <el-icon><DataAnalysis /></el-icon>
              <span>生信分析</span>
            </template>
            <el-menu-item index="/analysis/annotation">基因组注释</el-menu-item>
            <el-menu-item index="/analysis/mlst">MLST分型</el-menu-item>
            <el-menu-item index="/analysis/resistance">耐药基因</el-menu-item>
            <el-menu-item index="/analysis/virulence">毒力基因</el-menu-item>
            <el-menu-item index="/analysis/phylogeny">系统发育</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/reports">
            <el-icon><Document /></el-icon>
            <span>报告中心</span>
          </el-menu-item>
          <el-menu-item index="/user-management" v-if="isAdmin">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/system-settings" v-if="isAdmin">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
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
                    <el-dropdown-item @click="goToSettings">个人设置</el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'App',
  setup () {
    const route = useRoute()
    const router = useRouter()
    const store = useStore()

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
        ElMessage.success('退出登录成功')
        router.push('/login')
      } catch (error) {
        ElMessage.error('退出登录失败')
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
