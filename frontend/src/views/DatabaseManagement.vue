<template>
  <div class="database-management-container">
    <div class="page-header">
      <h1>数据库管理</h1>
      <p>管理和维护PAMS数据库</p>
    </div>

    <div class="content-area">
      <!-- 数据库统计信息 -->
      <el-card class="stats-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span>数据库统计</span>
            <el-button type="primary" size="small" @click="loadStats">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <div v-if="loading.stats" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else class="stats-grid">
          <div v-for="(count, table) in stats" :key="table" class="stat-item">
            <div class="stat-label">{{ getTableDisplayName(table) }}</div>
            <div class="stat-value">{{ count }}</div>
          </div>
        </div>
      </el-card>

      <!-- 数据库操作 -->
      <el-card class="operations-card" shadow="hover">
        <template #header>
          <span>数据库操作</span>
        </template>
        
        <div class="operations-grid">
          <!-- 清空数据 -->
          <div class="operation-item">
            <div class="operation-info">
              <h3>清空所有数据</h3>
              <p>删除所有表中的数据，但保留表结构。系统将重新创建默认管理员账户。</p>
            </div>
            <el-button 
              type="warning" 
              :loading="loading.clear"
              @click="confirmClearData"
            >
              <el-icon><Delete /></el-icon>
              清空数据
            </el-button>
          </div>

          <!-- 重置数据库 -->
          <div class="operation-item">
            <div class="operation-info">
              <h3>完全重置数据库</h3>
              <p>删除数据库文件并重新创建。这将清除所有数据和配置，恢复到初始状态。</p>
            </div>
            <el-button 
              type="danger" 
              :loading="loading.reset"
              @click="confirmResetDatabase"
            >
              <el-icon><RefreshRight /></el-icon>
              重置数据库
            </el-button>
          </div>

          <!-- 数据库健康检查 -->
          <div class="operation-item">
            <div class="operation-info">
              <h3>数据库健康检查</h3>
              <p>检查数据库完整性和性能状态。</p>
            </div>
            <el-button 
              type="info" 
              :loading="loading.health"
              @click="performHealthCheck"
            >
              <el-icon><Monitor /></el-icon>
              健康检查
            </el-button>
          </div>

          <!-- 优化数据库 -->
          <div class="operation-item">
            <div class="operation-info">
              <h3>优化数据库</h3>
              <p>清理碎片，优化查询性能。</p>
            </div>
            <el-button 
              type="success" 
              :loading="loading.optimize"
              @click="optimizeDatabase"
            >
              <el-icon><Tools /></el-icon>
              优化数据库
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 操作结果 -->
      <el-card v-if="lastResult" class="result-card" shadow="hover">
        <template #header>
          <span>操作结果</span>
        </template>
        
        <div class="result-content">
          <el-alert
            :title="lastResult.title"
            :type="lastResult.type"
            :description="lastResult.message"
            show-icon
            :closable="false"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh, 
  Delete, 
  RefreshRight, 
  Monitor, 
  Tools 
} from '@element-plus/icons-vue'

export default {
  name: 'DatabaseManagement',
  components: {
    Refresh,
    Delete,
    RefreshRight,
    Monitor,
    Tools
  },
  setup() {
    const stats = ref({})
    const lastResult = ref(null)
    const loading = reactive({
      stats: false,
      clear: false,
      reset: false,
      health: false,
      optimize: false
    })

    // 表名显示映射
    const tableDisplayNames = {
      users: '用户',
      strains: '菌株',
      genomes: '基因组',
      analysis_tasks: '分析任务',
      audit_logs: '审计日志',
      migrations: '迁移记录',
      species_config: '菌种配置',
      regions_config: '地区配置',
      sample_sources_config: '样本来源配置',
      projects_config: '项目配置',
      experiment_types_config: '实验类型配置'
    }

    const getTableDisplayName = (tableName) => {
      return tableDisplayNames[tableName] || tableName
    }

    // 加载数据库统计信息
    const loadStats = async () => {
      if (!window.electronAPI?.database?.getStats) {
        ElMessage.warning('数据库管理功能仅在Electron环境下可用')
        return
      }

      loading.stats = true
      try {
        const result = await window.electronAPI.database.getStats()
        stats.value = result
      } catch (error) {
        console.error('获取数据库统计失败:', error)
        ElMessage.error('获取数据库统计失败')
      } finally {
        loading.stats = false
      }
    }

    // 确认清空数据
    const confirmClearData = async () => {
      try {
        await ElMessageBox.confirm(
          '此操作将删除所有数据表中的数据，但保留表结构。系统将重新创建默认管理员账户。此操作不可恢复！',
          '确认清空数据',
          {
            confirmButtonText: '确定清空',
            cancelButtonText: '取消',
            type: 'warning',
            dangerouslyUseHTMLString: true
          }
        )
        
        await clearAllData()
      } catch (error) {
        // 用户取消操作
      }
    }

    // 清空所有数据
    const clearAllData = async () => {
      if (!window.electronAPI?.database?.clearAllData) {
        ElMessage.warning('数据库管理功能仅在Electron环境下可用')
        return
      }

      loading.clear = true
      try {
        const result = await window.electronAPI.database.clearAllData()
        
        if (result.success) {
          lastResult.value = {
            title: '清空成功',
            type: 'success',
            message: result.message || '所有数据已清空，默认管理员账户已重新创建'
          }
          ElMessage.success('数据清空成功')
          await loadStats()
        } else {
          throw new Error(result.error || '清空失败')
        }
      } catch (error) {
        console.error('清空数据失败:', error)
        lastResult.value = {
          title: '清空失败',
          type: 'error',
          message: error.message
        }
        ElMessage.error('清空数据失败: ' + error.message)
      } finally {
        loading.clear = false
      }
    }

    // 确认重置数据库
    const confirmResetDatabase = async () => {
      try {
        await ElMessageBox.confirm(
          '此操作将完全删除数据库文件并重新创建。所有数据和配置都将丢失！此操作不可恢复！',
          '确认重置数据库',
          {
            confirmButtonText: '确定重置',
            cancelButtonText: '取消',
            type: 'error',
            dangerouslyUseHTMLString: true
          }
        )
        
        await resetDatabase()
      } catch (error) {
        // 用户取消操作
      }
    }

    // 重置数据库
    const resetDatabase = async () => {
      if (!window.electronAPI?.database?.resetDatabase) {
        ElMessage.warning('数据库管理功能仅在Electron环境下可用')
        return
      }

      loading.reset = true
      try {
        const result = await window.electronAPI.database.resetDatabase()
        
        if (result.success) {
          lastResult.value = {
            title: '重置成功',
            type: 'success',
            message: result.message || '数据库已完全重置'
          }
          ElMessage.success('数据库重置成功')
          await loadStats()
        } else {
          throw new Error(result.error || '重置失败')
        }
      } catch (error) {
        console.error('重置数据库失败:', error)
        lastResult.value = {
          title: '重置失败',
          type: 'error',
          message: error.message
        }
        ElMessage.error('重置数据库失败: ' + error.message)
      } finally {
        loading.reset = false
      }
    }

    // 数据库健康检查
    const performHealthCheck = async () => {
      if (!window.electronAPI?.database?.healthCheck) {
        ElMessage.warning('数据库管理功能仅在Electron环境下可用')
        return
      }

      loading.health = true
      try {
        const result = await window.electronAPI.database.healthCheck()
        
        lastResult.value = {
          title: '健康检查完成',
          type: result.status === 'ok' ? 'success' : 'warning',
          message: result.message || '数据库状态正常'
        }
        ElMessage.success('健康检查完成')
      } catch (error) {
        console.error('健康检查失败:', error)
        lastResult.value = {
          title: '健康检查失败',
          type: 'error',
          message: error.message
        }
        ElMessage.error('健康检查失败: ' + error.message)
      } finally {
        loading.health = false
      }
    }

    // 优化数据库
    const optimizeDatabase = async () => {
      if (!window.electronAPI?.database?.optimize) {
        ElMessage.warning('数据库管理功能仅在Electron环境下可用')
        return
      }

      loading.optimize = true
      try {
        const result = await window.electronAPI.database.optimize()
        
        lastResult.value = {
          title: '优化完成',
          type: 'success',
          message: result.message || '数据库优化完成'
        }
        ElMessage.success('数据库优化完成')
      } catch (error) {
        console.error('优化数据库失败:', error)
        lastResult.value = {
          title: '优化失败',
          type: 'error',
          message: error.message
        }
        ElMessage.error('优化数据库失败: ' + error.message)
      } finally {
        loading.optimize = false
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      stats,
      lastResult,
      loading,
      getTableDisplayName,
      loadStats,
      confirmClearData,
      confirmResetDatabase,
      performHealthCheck,
      optimizeDatabase
    }
  }
}
</script>

<style scoped>
.database-management-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin: 0 0 10px 0;
  font-size: 28px;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-card {
  background: white;
  border-radius: 8px;
}

.loading-container {
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.stat-item {
  text-align: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}

.operations-card {
  background: white;
  border-radius: 8px;
}

.operations-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.operation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fafafa;
}

.operation-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #303133;
}

.operation-info p {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.result-card {
  background: white;
  border-radius: 8px;
}

.result-content {
  padding: 10px 0;
}

@media (max-width: 768px) {
  .database-management-container {
    padding: 10px;
  }
  
  .operation-item {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
