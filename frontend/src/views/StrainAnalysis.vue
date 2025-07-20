<template>
  <div class="strain-analysis-container">
    <div class="page-header">
      <h1>菌株筛选分析</h1>
      <p>对菌株数据进行筛选、统计分析和图表生成</p>
    </div>

    <div class="content-area">
      <el-row :gutter="20">
        <!-- 筛选面板 -->
        <el-col :span="8">
          <el-card title="筛选条件">
            <template #header>
              <span>筛选条件</span>
              <el-button
                type="primary"
                @click="applyFilter"
                style="float: right; margin-left: 10px;"
              >
                应用筛选
              </el-button>
              <el-button
                @click="resetFilter"
                style="float: right;"
              >
                重置
              </el-button>
            </template>

            <el-form :model="filterForm" label-width="100px">
              <el-divider content-position="left">基本信息</el-divider>

              <el-form-item label="菌株编号">
                <el-input
                  v-model="filterForm.strain_id"
                  placeholder="请输入菌株编号"
                  clearable
                />
              </el-form-item>

              <el-form-item label="菌种（属）">
                <el-select
                  v-model="filterForm.species"
                  placeholder="请选择菌种"
                  clearable
                  multiple
                >
                  <el-option label="大肠杆菌" value="E.coli" />
                  <el-option label="沙门氏菌" value="Salmonella" />
                  <el-option label="志贺氏菌" value="Shigella" />
                </el-select>
              </el-form-item>

              <el-form-item label="地区">
                <el-select
                  v-model="filterForm.region"
                  placeholder="请选择地区"
                  clearable
                  multiple
                >
                  <el-option label="北京市" value="beijing" />
                  <el-option label="上海市" value="shanghai" />
                  <el-option label="广东省" value="guangdong" />
                </el-select>
              </el-form-item>

              <el-form-item label="样本来源">
                <el-select
                  v-model="filterForm.sample_source"
                  placeholder="请选择样本来源"
                  clearable
                  multiple
                >
                  <el-option label="血液" value="blood" />
                  <el-option label="粪便" value="feces" />
                  <el-option label="食品" value="food" />
                </el-select>
              </el-form-item>

              <el-form-item label="分离日期">
                <el-date-picker
                  v-model="filterForm.isolation_date_range"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                />
              </el-form-item>

              <el-divider content-position="left">特征信息</el-divider>

              <el-form-item label="毒力基因">
                <el-input
                  v-model="filterForm.virulence_genes"
                  placeholder="请输入毒力基因"
                  clearable
                />
              </el-form-item>

              <el-form-item label="耐药谱">
                <el-input
                  v-model="filterForm.antibiotic_resistance"
                  placeholder="请输入耐药谱"
                  clearable
                />
              </el-form-item>

              <el-form-item label="ST型别">
                <el-input
                  v-model="filterForm.st_type"
                  placeholder="请输入ST型别"
                  clearable
                />
              </el-form-item>

              <el-form-item label="血清型别">
                <el-input
                  v-model="filterForm.serotype"
                  placeholder="请输入血清型别"
                  clearable
                />
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>

        <!-- 结果展示 -->
        <el-col :span="16">
          <el-card>
            <template #header>
              <span>分析结果</span>
              <el-button
                type="success"
                @click="exportResults"
                style="float: right; margin-left: 10px;"
              >
                导出结果
              </el-button>
              <el-button
                @click="generateReport"
                style="float: right;"
              >
                生成报告
              </el-button>
            </template>

            <el-tabs v-model="activeTab" type="card">
              <!-- 统计概览 -->
              <el-tab-pane label="统计概览" name="overview">
                <div class="statistics-overview">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ statistics.total }}</div>
                        <div class="stat-label">总菌株数</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ statistics.filtered }}</div>
                        <div class="stat-label">筛选结果</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ statistics.species_count }}</div>
                        <div class="stat-label">菌种数量</div>
                      </div>
                    </el-col>
                    <el-col :span="6">
                      <div class="stat-item">
                        <div class="stat-number">{{ statistics.region_count }}</div>
                        <div class="stat-label">地区数量</div>
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-tab-pane>

              <!-- 图表分析 -->
              <el-tab-pane label="图表分析" name="charts">
                <div class="chart-container">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <div class="chart-item">
                        <h4>菌种分布</h4>
                        <v-chart :option="speciesChartOption" style="height: 300px;" />
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="chart-item">
                        <h4>地区分布</h4>
                        <v-chart :option="regionChartOption" style="height: 300px;" />
                      </div>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" style="margin-top: 20px;">
                    <el-col :span="12">
                      <div class="chart-item">
                        <h4>样本来源分布</h4>
                        <v-chart :option="sourceChartOption" style="height: 300px;" />
                      </div>
                    </el-col>
                    <el-col :span="12">
                      <div class="chart-item">
                        <h4>月度趋势</h4>
                        <v-chart :option="trendChartOption" style="height: 300px;" />
                      </div>
                    </el-col>
                  </el-row>
                </div>
              </el-tab-pane>

              <!-- 数据列表 -->
              <el-tab-pane label="数据列表" name="data">
                <el-table
                  :data="filteredData"
                  v-loading="loading"
                  border
                  style="width: 100%"
                  max-height="500"
                >
                  <el-table-column prop="strain_id" label="菌株编号" width="120" />
                  <el-table-column prop="species" label="菌种" width="100" />
                  <el-table-column prop="region" label="地区" width="100" />
                  <el-table-column prop="sample_source" label="样本来源" width="100" />
                  <el-table-column prop="isolation_date" label="分离日期" width="100" />
                  <el-table-column prop="virulence_genes" label="毒力基因" width="120" />
                  <el-table-column prop="antibiotic_resistance" label="耐药谱" width="120" />
                  <el-table-column prop="st_type" label="ST型别" width="100" />
                  <el-table-column prop="serotype" label="血清型别" width="100" />
                </el-table>

                <div class="pagination-container">
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
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'StrainAnalysis',
  setup () {
    const loading = ref(false)
    const activeTab = ref('overview')

    const filterForm = reactive({
      strain_id: '',
      species: [],
      region: [],
      sample_source: [],
      isolation_date_range: null,
      virulence_genes: '',
      antibiotic_resistance: '',
      st_type: '',
      serotype: ''
    })

    const filteredData = ref([])
    const allData = ref([])

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    const statistics = reactive({
      total: 0,
      filtered: 0,
      species_count: 0,
      region_count: 0
    })

    // 加载数据
    const loadData = async () => {
      loading.value = true
      try {
        // TODO: 实现从后端加载数据
        // 模拟数据
        allData.value = [
          {
            strain_id: 'E.coli-001',
            species: 'E.coli',
            region: 'beijing',
            sample_source: 'blood',
            isolation_date: '2023-01-15',
            virulence_genes: 'stx1, stx2',
            antibiotic_resistance: 'AMP, TET',
            st_type: 'ST11',
            serotype: 'O157:H7'
          },
          {
            strain_id: 'Salmonella-002',
            species: 'Salmonella',
            region: 'shanghai',
            sample_source: 'feces',
            isolation_date: '2023-01-12',
            virulence_genes: 'invA, spvC',
            antibiotic_resistance: 'AMP, CHL',
            st_type: 'ST19',
            serotype: 'Typhimurium'
          },
          {
            strain_id: 'Shigella-003',
            species: 'Shigella',
            region: 'guangdong',
            sample_source: 'food',
            isolation_date: '2023-01-18',
            virulence_genes: 'ipaH, virF',
            antibiotic_resistance: 'TET, STR',
            st_type: 'ST3',
            serotype: 'flexneri'
          }
        ]

        filteredData.value = allData.value
        updateStatistics()
      } catch (error) {
        ElMessage.error('加载数据失败')
      } finally {
        loading.value = false
      }
    }

    // 更新统计信息
    const updateStatistics = () => {
      statistics.total = allData.value.length
      statistics.filtered = filteredData.value.length
      statistics.species_count = new Set(filteredData.value.map(item => item.species)).size
      statistics.region_count = new Set(filteredData.value.map(item => item.region)).size
    }

    // 应用筛选
    const applyFilter = () => {
      let filtered = allData.value

      // 菌株编号筛选
      if (filterForm.strain_id) {
        filtered = filtered.filter(item =>
          item.strain_id.toLowerCase().includes(filterForm.strain_id.toLowerCase())
        )
      }

      // 菌种筛选
      if (filterForm.species.length > 0) {
        filtered = filtered.filter(item =>
          filterForm.species.includes(item.species)
        )
      }

      // 地区筛选
      if (filterForm.region.length > 0) {
        filtered = filtered.filter(item =>
          filterForm.region.includes(item.region)
        )
      }

      // 样本来源筛选
      if (filterForm.sample_source.length > 0) {
        filtered = filtered.filter(item =>
          filterForm.sample_source.includes(item.sample_source)
        )
      }

      // 日期范围筛选
      if (filterForm.isolation_date_range) {
        const [startDate, endDate] = filterForm.isolation_date_range
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.isolation_date)
          return itemDate >= startDate && itemDate <= endDate
        })
      }

      // 毒力基因筛选
      if (filterForm.virulence_genes) {
        filtered = filtered.filter(item =>
          item.virulence_genes.toLowerCase().includes(filterForm.virulence_genes.toLowerCase())
        )
      }

      // 耐药谱筛选
      if (filterForm.antibiotic_resistance) {
        filtered = filtered.filter(item =>
          item.antibiotic_resistance.toLowerCase().includes(filterForm.antibiotic_resistance.toLowerCase())
        )
      }

      // ST型别筛选
      if (filterForm.st_type) {
        filtered = filtered.filter(item =>
          item.st_type.toLowerCase().includes(filterForm.st_type.toLowerCase())
        )
      }

      // 血清型别筛选
      if (filterForm.serotype) {
        filtered = filtered.filter(item =>
          item.serotype.toLowerCase().includes(filterForm.serotype.toLowerCase())
        )
      }

      filteredData.value = filtered
      pagination.total = filtered.length
      pagination.current = 1
      updateStatistics()
    }

    // 重置筛选
    const resetFilter = () => {
      filterForm.strain_id = ''
      filterForm.species = []
      filterForm.region = []
      filterForm.sample_source = []
      filterForm.isolation_date_range = null
      filterForm.virulence_genes = ''
      filterForm.antibiotic_resistance = ''
      filterForm.st_type = ''
      filterForm.serotype = ''

      filteredData.value = allData.value
      pagination.total = allData.value.length
      pagination.current = 1
      updateStatistics()
    }

    // 导出结果
    const exportResults = () => {
      // TODO: 实现导出功能
      ElMessage.success('导出功能开发中')
    }

    // 生成报告
    const generateReport = () => {
      // TODO: 实现报告生成功能
      ElMessage.success('报告生成功能开发中')
    }

    // 分页处理
    const handleSizeChange = (size) => {
      pagination.size = size
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
    }

    // 图表配置
    const speciesChartOption = computed(() => {
      const speciesCount = {}
      filteredData.value.forEach(item => {
        speciesCount[item.species] = (speciesCount[item.species] || 0) + 1
      })

      return {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '70%',
          data: Object.entries(speciesCount).map(([name, value]) => ({ name, value })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    })

    const regionChartOption = computed(() => {
      const regionCount = {}
      filteredData.value.forEach(item => {
        regionCount[item.region] = (regionCount[item.region] || 0) + 1
      })

      return {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '70%',
          data: Object.entries(regionCount).map(([name, value]) => ({ name, value })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    })

    const sourceChartOption = computed(() => {
      const sourceCount = {}
      filteredData.value.forEach(item => {
        sourceCount[item.sample_source] = (sourceCount[item.sample_source] || 0) + 1
      })

      return {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie',
          radius: '70%',
          data: Object.entries(sourceCount).map(([name, value]) => ({ name, value })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      }
    })

    const trendChartOption = computed(() => {
      return {
        tooltip: { trigger: 'axis' },
        xAxis: {
          type: 'category',
          data: ['1月', '2月', '3月', '4月', '5月', '6月']
        },
        yAxis: { type: 'value' },
        series: [{
          name: '菌株数量',
          type: 'line',
          data: [5, 8, 12, 6, 10, 15],
          smooth: true
        }]
      }
    })

    onMounted(() => {
      loadData()
    })

    return {
      loading,
      activeTab,
      filterForm,
      filteredData,
      pagination,
      statistics,
      applyFilter,
      resetFilter,
      exportResults,
      generateReport,
      handleSizeChange,
      handleCurrentChange,
      speciesChartOption,
      regionChartOption,
      sourceChartOption,
      trendChartOption
    }
  }
}
</script>

<style scoped>
.strain-analysis-container {
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
  margin-top: 20px;
}

.statistics-overview {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #409EFF;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.chart-container {
  margin-top: 20px;
}

.chart-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  text-align: center;
}

.chart-item h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
