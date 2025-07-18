<template>
  <div class="analysis-container">
    <div class="page-header">
      <h1>生信分析</h1>
      <p>生物信息学分析工具和结果管理</p>
    </div>

    <div class="content-area">
      <div class="analysis-nav">
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          @select="handleMenuSelect"
        >
          <el-menu-item index="annotation">
            <el-icon><Document /></el-icon>
            基因组注释
          </el-menu-item>
          <el-menu-item index="mlst">
            <el-icon><DataAnalysis /></el-icon>
            MLST分型
          </el-menu-item>
          <el-menu-item index="resistance">
            <el-icon><Lock /></el-icon>
            耐药基因
          </el-menu-item>
          <el-menu-item index="virulence">
            <el-icon><Warning /></el-icon>
            毒力基因
          </el-menu-item>
          <el-menu-item index="phylogeny">
            <el-icon><Share /></el-icon>
            系统发育
          </el-menu-item>
        </el-menu>
      </div>

      <div class="analysis-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Document, DataAnalysis, Lock, Warning, Share } from '@element-plus/icons-vue'

export default {
  name: 'Analysis',
  components: {
    Document,
    DataAnalysis,
    Lock,
    Warning,
    Share
  },
  setup () {
    const route = useRoute()
    const router = useRouter()

    const activeMenu = computed(() => {
      const path = route.path
      if (path.includes('annotation')) return 'annotation'
      if (path.includes('mlst')) return 'mlst'
      if (path.includes('resistance')) return 'resistance'
      if (path.includes('virulence')) return 'virulence'
      if (path.includes('phylogeny')) return 'phylogeny'
      return 'annotation' // 默认选择基因组注释
    })

    const handleMenuSelect = (index) => {
      router.push({ name: index.charAt(0).toUpperCase() + index.slice(1) })
    }

    // 如果访问的是根路径，自动跳转到注释页面
    watch(() => route.path, (newPath) => {
      if (newPath === '/analysis') {
        router.push({ name: 'Annotation' })
      }
    }, { immediate: true })

    return {
      activeMenu,
      handleMenuSelect
    }
  }
}
</script>

<style scoped>
.analysis-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.content-area {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.analysis-nav {
  background: #f5f7fa;
  padding: 0 20px;
}

.analysis-nav .el-menu {
  border-bottom: none;
  background: transparent;
}

.analysis-nav .el-menu-item {
  height: 60px;
  line-height: 60px;
  border-bottom: 3px solid transparent;
  margin-right: 20px;
}

.analysis-nav .el-menu-item:hover {
  background: rgba(64, 158, 255, 0.1);
}

.analysis-nav .el-menu-item.is-active {
  background: rgba(64, 158, 255, 0.1);
  border-bottom-color: #409eff;
}

.analysis-content {
  padding: 20px;
  min-height: 600px;
}
</style>
