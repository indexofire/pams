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
            <div class="card-header">
              <span>菌种分布</span>
              <el-button size="small" @click="refreshData">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <v-chart :option="speciesChartOption" style="height: 300px;" v-loading="loading" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="月度趋势">
          <template #header>
            <div class="card-header">
              <span>月度趋势</span>
              <el-select v-model="trendType" size="small" style="width: 100px;">
                <el-option label="菌株" value="strains" />
                <el-option label="基因组" value="genomes" />
                <el-option label="分析" value="analysis" />
              </el-select>
            </div>
          </template>
          <v-chart :option="trendChartOption" style="height: 300px;" v-loading="loading" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="dashboard-content">
      <el-col :span="12">
        <el-card title="最近活动">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
              <el-link type="primary" @click="$router.push('/strains')">查看更多</el-link>
            </div>
          </template>
          <div v-loading="loading">
            <el-timeline v-if="recentActivities.length > 0">
              <el-timeline-item
                v-for="activity in recentActivities"
                :key="activity.id"
                :timestamp="activity.time"
                :type="activity.type"
              >
                {{ activity.description }}
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无活动记录" />
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card title="快速操作">
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button
              type="primary"
              size="large"
              @click="$router.push('/strains')"
              class="action-button"
            >
              <el-icon><Plus /></el-icon>
              添加菌株
            </el-button>
            <el-button
              type="success"
              size="large"
              @click="$router.push('/genomes')"
              class="action-button"
            >
              <el-icon><Upload /></el-icon>
              上传基因组
            </el-button>
            <el-button
              type="info"
              size="large"
              @click="$router.push('/analysis')"
              class="action-button"
            >
              <el-icon><DataAnalysis /></el-icon>
              生信分析
            </el-button>
            <el-button
              type="warning"
              size="large"
              @click="$router.push('/reports')"
              class="action-button"
            >
              <el-icon><Document /></el-icon>
              生成报告
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import {
  Grid,
  Document,
  DataAnalysis,
  Clock,
  Refresh,
  Plus,
  Upload
} from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    Grid,
    Document,
    DataAnalysis,
    Clock,
    Refresh,
    Plus,
    Upload
  },
  setup () {
    const store = useStore()
    const loading = ref(true)
    const trendType = ref('strains')

    const statistics = computed(() => store.state.statistics)
    const recentActivities = computed(() => statistics.value.recentActivities || [])

    const speciesChartOption = computed(() => {
      const data = statistics.value.speciesDistribution || [
        { name: '大肠杆菌', value: 35 },
        { name: '沙门氏菌', value: 25 },
        { name: '志贺氏菌', value: 20 },
        { name: '弧菌', value: 15 },
        { name: '其他', value: 5 }
      ]

      return {
        title: {
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: '菌种分布',
            type: 'pie',
            radius: '70%',
            data,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            },
            label: {
              show: true,
              formatter: '{b}: {c}'
            }
          }
        ]
      }
    })

    const trendChartOption = computed(() => {
      const monthlyData = statistics.value.monthlyData || []
      const months = monthlyData.map(item => item.month)

      let data = []
      let title = ''
      let color = '#409EFF'

      switch (trendType.value) {
      case 'strains':
        data = monthlyData.map(item => item.strains)
        title = '新增菌株'
        color = '#409EFF'
        break
      case 'genomes':
        data = monthlyData.map(item => item.genomes)
        title = '基因组测序'
        color = '#67C23A'
        break
      case 'analysis':
        data = monthlyData.map(item => item.analysis)
        title = '完成分析'
        color = '#E6A23C'
        break
      }

      return {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            name: title,
            type: 'line',
            data,
            smooth: true,
            lineStyle: {
              color
            },
            itemStyle: {
              color
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: color + '80'
                }, {
                  offset: 1, color: color + '10'
                }]
              }
            }
          }
        ]
      }
    })

    const loadDashboardData = async () => {
      loading.value = true
      try {
        // 并行加载所有数据
        await Promise.all([
          store.dispatch('fetchStrains'),
          store.dispatch('fetchGenomes'),
          store.dispatch('fetchAnalysisTasks'),
          store.dispatch('fetchStatistics')
        ])
      } catch (error) {
        console.error('加载仪表板数据失败:', error)
        ElMessage.error('加载数据失败：' + (error.message || '未知错误'))
      } finally {
        loading.value = false
      }
    }

    const refreshData = async () => {
      await loadDashboardData()
      ElMessage.success('数据刷新成功')
    }

    // 监听趋势类型变化
    watch(trendType, () => {
      // 图表会自动重新渲染
    })

    onMounted(async () => {
      await loadDashboardData()
    })

    return {
      statistics,
      recentActivities,
      speciesChartOption,
      trendChartOption,
      loading,
      trendType,
      refreshData
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

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .quick-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;

    .action-button {
      width: 100%;
      height: 60px;
      font-size: 16px;

      .el-icon {
        margin-right: 8px;
      }
    }
  }

  .el-timeline {
    margin-top: 10px;
  }
}
</style>
