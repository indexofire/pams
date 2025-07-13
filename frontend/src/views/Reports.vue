<template>
  <div class="reports-container">
    <div class="page-header">
      <h1>报告中心</h1>
      <p>生成和管理分析报告</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="generateReport">
          <el-icon><Document /></el-icon>
          生成报告
        </el-button>
        <el-button @click="batchExport">
          <el-icon><Download /></el-icon>
          批量导出
        </el-button>
        <el-button @click="refreshReports">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="报告类型">
            <el-select
              v-model="filterForm.type"
              placeholder="请选择报告类型"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="基因组注释" value="annotation" />
              <el-option label="MLST分型" value="mlst" />
              <el-option label="耐药基因" value="resistance" />
              <el-option label="毒力基因" value="virulence" />
              <el-option label="系统发育" value="phylogeny" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="filterForm.status"
              placeholder="请选择状态"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="已完成" value="completed" />
              <el-option label="生成中" value="generating" />
              <el-option label="失败" value="failed" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchReports">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="reports"
          v-loading="loading"
          border
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="报告名称" />
          <el-table-column prop="type" label="报告类型" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="getStatusType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" />
          <el-table-column prop="file_size" label="文件大小" />
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button
                size="small"
                @click="viewReport(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                查看
              </el-button>
              <el-button
                size="small"
                type="success"
                @click="downloadReport(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                下载
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="shareReport(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                分享
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteReport(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Document, Download, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'Reports',
  components: {
    Document,
    Download,
    Refresh
  },
  setup () {
    const loading = ref(false)
    const reports = ref([])

    const filterForm = reactive({
      type: '',
      status: '',
      dateRange: null
    })

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    const loadReports = async () => {
      loading.value = true
      try {
        // TODO: 实现从后端加载报告数据的逻辑
        // const response = await api.getReports(pagination, filterForm)
        // reports.value = response.data
        // pagination.total = response.total

        // 临时模拟数据
        reports.value = [
          {
            id: 1,
            name: 'E.coli-001基因组注释报告',
            type: 'annotation',
            status: 'completed',
            created_at: '2023-01-15 10:30:00',
            file_size: '2.5 MB'
          },
          {
            id: 2,
            name: 'MLST分型分析报告',
            type: 'mlst',
            status: 'generating',
            created_at: '2023-01-15 11:00:00',
            file_size: '-'
          }
        ]
        pagination.total = 2
      } catch (error) {
        console.error('加载报告数据失败:', error)
      } finally {
        loading.value = false
      }
    }

    const searchReports = () => {
      pagination.current = 1
      loadReports()
    }

    const resetFilter = () => {
      filterForm.type = ''
      filterForm.status = ''
      filterForm.dateRange = null
      searchReports()
    }

    const getStatusType = (status) => {
      switch (status) {
      case 'completed': return 'success'
      case 'generating': return 'warning'
      case 'failed': return 'danger'
      default: return 'info'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
      case 'completed': return '已完成'
      case 'generating': return '生成中'
      case 'failed': return '失败'
      default: return '未知'
      }
    }

    const generateReport = () => {
      // TODO: 实现生成报告的逻辑
      console.log('生成报告')
    }

    const batchExport = () => {
      // TODO: 实现批量导出的逻辑
      console.log('批量导出')
    }

    const refreshReports = () => {
      loadReports()
    }

    const viewReport = (report) => {
      // TODO: 实现查看报告的逻辑
      console.log('查看报告:', report)
    }

    const downloadReport = (report) => {
      // TODO: 实现下载报告的逻辑
      console.log('下载报告:', report)
    }

    const shareReport = (report) => {
      // TODO: 实现分享报告的逻辑
      console.log('分享报告:', report)
    }

    const deleteReport = (report) => {
      // TODO: 实现删除报告的逻辑
      console.log('删除报告:', report)
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      loadReports()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadReports()
    }

    onMounted(() => {
      loadReports()
    })

    return {
      loading,
      reports,
      filterForm,
      pagination,
      searchReports,
      resetFilter,
      getStatusType,
      getStatusText,
      generateReport,
      batchExport,
      refreshReports,
      viewReport,
      downloadReport,
      shareReport,
      deleteReport,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.reports-container {
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
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
}

.filter-section {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
}

.table-section {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
