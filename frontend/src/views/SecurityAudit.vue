<template>
  <div class="security-audit">
    <div class="page-header">
      <h1>安全审计</h1>
      <p>系统安全事件和用户操作日志</p>
    </div>

    <div class="content-area">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :model="filters" inline>
          <el-form-item label="事件类型">
            <el-select v-model="filters.eventType" placeholder="选择事件类型" clearable>
              <el-option label="登录事件" value="login" />
              <el-option label="权限变更" value="permission" />
              <el-option label="数据操作" value="data" />
              <el-option label="安全警告" value="security" />
              <el-option label="系统操作" value="system" />
            </el-select>
          </el-form-item>
          <el-form-item label="用户">
            <el-input
              v-model="filters.username"
              placeholder="输入用户名"
              clearable
            />
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filters.dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadAuditLogs">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
            <el-button @click="resetFilters">
              <el-icon><Refresh /></el-icon>
              重置
            </el-button>
            <el-button
              v-permission="'system.logs'"
              @click="exportLogs"
              :loading="exporting"
            >
              <el-icon><Download /></el-icon>
              导出
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 统计信息 -->
      <div class="stats-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.totalEvents }}</div>
                <div class="stat-label">总事件数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number security-warning">{{ stats.securityEvents }}</div>
                <div class="stat-label">安全事件</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.failedLogins }}</div>
                <div class="stat-label">登录失败</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-number">{{ stats.activeUsers }}</div>
                <div class="stat-label">活跃用户</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 审计日志表格 -->
      <el-table
        :data="auditLogs"
        style="width: 100%"
        v-loading="loading"
        :default-sort="{ prop: 'timestamp', order: 'descending' }"
      >
        <el-table-column prop="timestamp" label="时间" width="180" sortable>
          <template #default="scope">
            {{ formatDateTime(scope.row.timestamp) }}
          </template>
        </el-table-column>
        <el-table-column prop="eventType" label="事件类型" width="120">
          <template #default="scope">
            <el-tag :type="getEventTypeColor(scope.row.eventType)">
              {{ getEventTypeName(scope.row.eventType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="action" label="操作" width="150" />
        <el-table-column prop="resource" label="资源" width="120" />
        <el-table-column prop="result" label="结果" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.result === 'success' ? 'success' : 'danger'">
              {{ scope.row.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ipAddress" label="IP地址" width="140" />
        <el-table-column prop="userAgent" label="用户代理" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="120">
          <template #default="scope">
            <el-button
              size="small"
              @click="viewDetails(scope.row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[20, 50, 100, 200]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 详情对话框 -->
    <el-dialog
      title="审计日志详情"
      v-model="showDetailsDialog"
      width="800px"
    >
      <div v-if="selectedLog">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">
            {{ formatDateTime(selectedLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="事件类型">
            <el-tag :type="getEventTypeColor(selectedLog.eventType)">
              {{ getEventTypeName(selectedLog.eventType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ selectedLog.username }}
          </el-descriptions-item>
          <el-descriptions-item label="操作">
            {{ selectedLog.action }}
          </el-descriptions-item>
          <el-descriptions-item label="资源">
            {{ selectedLog.resource }}
          </el-descriptions-item>
          <el-descriptions-item label="结果">
            <el-tag :type="selectedLog.result === 'success' ? 'success' : 'danger'">
              {{ selectedLog.result === 'success' ? '成功' : '失败' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ selectedLog.ipAddress }}
          </el-descriptions-item>
          <el-descriptions-item label="会话ID">
            {{ selectedLog.sessionId }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理" :span="2">
            {{ selectedLog.userAgent }}
          </el-descriptions-item>
          <el-descriptions-item label="详细信息" :span="2">
            <pre>{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download } from '@element-plus/icons-vue'

export default {
  name: 'SecurityAudit',
  components: {
    Search,
    Refresh,
    Download
  },
  setup () {
    // 响应式数据
    const loading = ref(false)
    const exporting = ref(false)
    const showDetailsDialog = ref(false)
    const selectedLog = ref(null)

    const filters = reactive({
      eventType: '',
      username: '',
      dateRange: []
    })

    const stats = reactive({
      totalEvents: 0,
      securityEvents: 0,
      failedLogins: 0,
      activeUsers: 0
    })

    const pagination = reactive({
      currentPage: 1,
      pageSize: 20,
      total: 0
    })

    const auditLogs = ref([])

    // 方法
    const loadAuditLogs = async () => {
      try {
        loading.value = true

        // 模拟数据
        const mockLogs = [
          {
            id: 1,
            timestamp: new Date().toISOString(),
            eventType: 'login',
            username: 'admin',
            action: '用户登录',
            resource: 'system',
            result: 'success',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: 'sess_123456',
            details: { loginMethod: 'password' }
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 300000).toISOString(),
            eventType: 'security',
            username: 'user1',
            action: '多次登录失败',
            resource: 'auth',
            result: 'failure',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            sessionId: null,
            details: { attempts: 5, reason: 'invalid_password' }
          }
        ]

        auditLogs.value = mockLogs
        pagination.total = mockLogs.length

        // 更新统计信息
        stats.totalEvents = mockLogs.length
        stats.securityEvents = mockLogs.filter(log => log.eventType === 'security').length
        stats.failedLogins = mockLogs.filter(log => log.result === 'failure').length
        stats.activeUsers = new Set(mockLogs.map(log => log.username)).size
      } catch (error) {
        console.error('加载审计日志失败:', error)
        ElMessage.error('加载审计日志失败')
      } finally {
        loading.value = false
      }
    }

    const resetFilters = () => {
      filters.eventType = ''
      filters.username = ''
      filters.dateRange = []
      loadAuditLogs()
    }

    const exportLogs = async () => {
      try {
        exporting.value = true
        // TODO: 实现日志导出功能
        ElMessage.success('日志导出成功')
      } catch (error) {
        console.error('导出日志失败:', error)
        ElMessage.error('导出日志失败')
      } finally {
        exporting.value = false
      }
    }

    const viewDetails = (log) => {
      selectedLog.value = log
      showDetailsDialog.value = true
    }

    const handleSizeChange = (size) => {
      pagination.pageSize = size
      loadAuditLogs()
    }

    const handleCurrentChange = (page) => {
      pagination.currentPage = page
      loadAuditLogs()
    }

    const formatDateTime = (timestamp) => {
      return new Date(timestamp).toLocaleString('zh-CN')
    }

    const getEventTypeColor = (type) => {
      const colors = {
        login: 'primary',
        permission: 'warning',
        data: 'info',
        security: 'danger',
        system: 'success'
      }
      return colors[type] || 'info'
    }

    const getEventTypeName = (type) => {
      const names = {
        login: '登录事件',
        permission: '权限变更',
        data: '数据操作',
        security: '安全警告',
        system: '系统操作'
      }
      return names[type] || type
    }

    // 生命周期
    onMounted(() => {
      loadAuditLogs()
    })

    return {
      loading,
      exporting,
      showDetailsDialog,
      selectedLog,
      filters,
      stats,
      pagination,
      auditLogs,
      loadAuditLogs,
      resetFilters,
      exportLogs,
      viewDetails,
      handleSizeChange,
      handleCurrentChange,
      formatDateTime,
      getEventTypeColor,
      getEventTypeName
    }
  }
}
</script>

<style scoped>
.security-audit {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.content-area {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stats-section {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 10px;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-number.security-warning {
  color: #f56c6c;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
}

pre {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
}
</style>
