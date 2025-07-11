<template>
  <div class="dashboard">
    <el-row :gutter="20" class="dashboard-header">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="40" color="#409EFF"><Grid /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalStrains }}</div>
              <div class="stat-label">总菌株数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="40" color="#67C23A"><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalGenomes }}</div>
              <div class="stat-label">基因组数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="40" color="#E6A23C"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.completedAnalysis }}</div>
              <div class="stat-label">完成分析</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-item">
            <div class="stat-icon">
              <el-icon size="40" color="#F56C6C"><Clock /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.pendingTasks }}</div>
              <div class="stat-label">待处理任务</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-content">
      <el-col :span="12">
        <el-card title="菌种分布">
          <template #header>
            <span>菌种分布</span>
          </template>
          <v-chart :option="speciesChartOption" style="height: 300px;" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="月度趋势">
          <template #header>
            <span>月度趋势</span>
          </template>
          <v-chart :option="trendChartOption" style="height: 300px;" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-content">
      <el-col :span="12">
        <el-card title="最近活动">
          <template #header>
            <span>最近活动</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.time"
              :type="activity.type"
            >
              {{ activity.description }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="任务状态">
          <template #header>
            <span>任务状态</span>
          </template>
          <div class="task-list">
            <div v-for="task in recentTasks" :key="task.id" class="task-item">
              <div class="task-info">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-meta">{{ task.genome_count }} 个基因组 • {{ task.created_at }}</div>
              </div>
              <el-tag :type="getTaskTagType(task.status)">{{ task.status }}</el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'Dashboard',
  setup() {
    const store = useStore()
    const loading = ref(true)
    
    const recentActivities = reactive([
      {
        id: 1,
        description: '用户张三上传了基因组文件 strain_001.fasta',
        time: '2024-01-15 14:30',
        type: 'success'
      },
      {
        id: 2,
        description: '完成了沙门氏菌 MLST 分型分析',
        time: '2024-01-15 13:45',
        type: 'primary'
      },
      {
        id: 3,
        description: '新增菌株记录：E. coli O157:H7',
        time: '2024-01-15 11:20',
        type: 'info'
      }
    ])

    const recentTasks = reactive([
      {
        id: 1,
        name: '耐药基因检测',
        genome_count: 5,
        status: '运行中',
        created_at: '2024-01-15'
      },
      {
        id: 2,
        name: '系统发育分析',
        genome_count: 12,
        status: '已完成',
        created_at: '2024-01-14'
      },
      {
        id: 3,
        name: 'MLST分型',
        genome_count: 8,
        status: '等待中',
        created_at: '2024-01-14'
      }
    ])

    const statistics = computed(() => store.state.statistics)

    const speciesChartOption = computed(() => ({
      title: {
        left: 'center'
      },
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: [
            { value: 35, name: '大肠杆菌' },
            { value: 25, name: '沙门氏菌' },
            { value: 20, name: '志贺氏菌' },
            { value: 15, name: '弧菌' },
            { value: 5, name: '其他' }
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    }))

    const trendChartOption = computed(() => ({
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月']
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '新增菌株',
          type: 'line',
          data: [12, 18, 15, 25, 22, 30],
          smooth: true
        },
        {
          name: '基因组测序',
          type: 'line',
          data: [8, 15, 12, 20, 18, 25],
          smooth: true
        }
      ]
    }))

    const getTaskTagType = (status) => {
      const typeMap = {
        '运行中': 'warning',
        '已完成': 'success',
        '等待中': 'info',
        '失败': 'danger'
      }
      return typeMap[status] || 'info'
    }

    onMounted(async () => {
      try {
        await store.dispatch('fetchStatistics')
      } catch (error) {
        console.error('加载仪表板数据失败:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      statistics,
      recentActivities,
      recentTasks,
      speciesChartOption,
      trendChartOption,
      getTaskTagType,
      loading
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  .dashboard-header {
    margin-bottom: 20px;
  }

  .dashboard-content {
    margin-bottom: 20px;
  }

  .stat-card {
    .stat-item {
      display: flex;
      align-items: center;
      
      .stat-icon {
        margin-right: 15px;
      }
      
      .stat-content {
        .stat-number {
          font-size: 28px;
          font-weight: bold;
          color: #303133;
          line-height: 1;
        }
        
        .stat-label {
          font-size: 14px;
          color: #909399;
          margin-top: 5px;
        }
      }
    }
  }

  .task-list {
    .task-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      .task-info {
        .task-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
        
        .task-meta {
          font-size: 12px;
          color: #909399;
        }
      }
    }
  }
}
</style> 