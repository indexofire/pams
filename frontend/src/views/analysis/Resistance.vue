<template>
  <div class="resistance-container">
    <div class="page-header">
      <h2>耐药基因分析</h2>
      <p>抗生素耐药性基因的检测和分析</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="startAnalysis">
          <el-icon><VideoPlay /></el-icon>
          开始分析
        </el-button>
        <el-button @click="batchAnalysis">
          <el-icon><List /></el-icon>
          批量分析
        </el-button>
        <el-button @click="viewDatabase">
          <el-icon><DataBoard /></el-icon>
          查看数据库
        </el-button>
      </div>

      <div class="resistance-form">
        <el-form :model="resistanceForm" label-width="120px">
          <el-form-item label="选择基因组">
            <el-select
              v-model="resistanceForm.genomeId"
              placeholder="请选择要分析的基因组"
              style="width: 100%"
            >
              <el-option
                v-for="genome in genomes"
                :key="genome.id"
                :label="genome.name"
                :value="genome.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="数据库选择">
            <el-checkbox-group v-model="resistanceForm.databases">
              <el-checkbox label="card">CARD (耐药基因数据库)</el-checkbox>
              <el-checkbox label="resfinder">ResFinder</el-checkbox>
              <el-checkbox label="argannot">ARG-ANNOT</el-checkbox>
              <el-checkbox label="ncbi">NCBI AMR</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="抗生素类型">
            <el-checkbox-group v-model="resistanceForm.antibiotics">
              <el-checkbox label="beta-lactam">β-内酰胺类</el-checkbox>
              <el-checkbox label="fluoroquinolone">氟喹诺酮类</el-checkbox>
              <el-checkbox label="aminoglycoside">氨基糖苷类</el-checkbox>
              <el-checkbox label="macrolide">大环内酯类</el-checkbox>
              <el-checkbox label="tetracycline">四环素类</el-checkbox>
              <el-checkbox label="chloramphenicol">氯霉素类</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="分析参数">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最小覆盖度">
                  <el-input-number
                    v-model="resistanceForm.minCoverage"
                    :min="0"
                    :max="100"
                    :step="5"
                  />
                  <span style="margin-left: 10px;">%</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最小相似度">
                  <el-input-number
                    v-model="resistanceForm.minIdentity"
                    :min="0"
                    :max="100"
                    :step="5"
                  />
                  <span style="margin-left: 10px;">%</span>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitAnalysis">提交分析任务</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="results-section">
        <h3>耐药基因分析结果</h3>
        <el-table :data="resistanceResults" v-loading="loading" border>
          <el-table-column prop="id" label="任务ID" width="80" />
          <el-table-column prop="genome_name" label="基因组" />
          <el-table-column prop="gene_count" label="基因数量" />
          <el-table-column prop="resistance_genes" label="耐药基因" width="300">
            <template #default="scope">
              <el-tag
                v-for="gene in scope.row.resistance_genes.slice(0, 3)"
                :key="gene.name"
                :type="getGeneType(gene.class)"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ gene.name }}
              </el-tag>
              <el-tag
                v-if="scope.row.resistance_genes.length > 3"
                size="small"
                type="info"
              >
                +{{ scope.row.resistance_genes.length - 3 }} 更多
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                size="small"
                @click="viewResult(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                查看详情
              </el-button>
              <el-button
                size="small"
                type="success"
                @click="downloadResult(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { VideoPlay, List, DataBoard } from '@element-plus/icons-vue'

export default {
  name: 'Resistance',
  components: {
    VideoPlay,
    List,
    DataBoard
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])
    const resistanceResults = ref([])

    const resistanceForm = reactive({
      genomeId: '',
      databases: ['card', 'resfinder'],
      antibiotics: ['beta-lactam', 'fluoroquinolone'],
      minCoverage: 90,
      minIdentity: 80
    })

    const loadGenomes = async () => {
      try {
        genomes.value = [
          { id: 1, name: 'E.coli-001-genome' },
          { id: 2, name: 'S.aureus-002-genome' }
        ]
      } catch (error) {
        console.error('加载基因组列表失败:', error)
      }
    }

    const loadResistanceResults = async () => {
      loading.value = true
      try {
        resistanceResults.value = [
          {
            id: 1,
            genome_name: 'E.coli-001-genome',
            gene_count: 5,
            resistance_genes: [
              { name: 'blaTEM-1', class: 'beta-lactam' },
              { name: 'aac(3)-IIa', class: 'aminoglycoside' },
              { name: 'qnrS1', class: 'fluoroquinolone' },
              { name: 'catA1', class: 'chloramphenicol' },
              { name: 'tet(A)', class: 'tetracycline' }
            ],
            status: 'completed',
            created_at: '2023-01-15 10:30:00'
          },
          {
            id: 2,
            genome_name: 'S.aureus-002-genome',
            gene_count: 3,
            resistance_genes: [
              { name: 'mecA', class: 'beta-lactam' },
              { name: 'aph(3\')-III', class: 'aminoglycoside' },
              { name: 'erm(C)', class: 'macrolide' }
            ],
            status: 'completed',
            created_at: '2023-01-15 11:00:00'
          }
        ]
      } catch (error) {
        console.error('加载耐药基因结果失败:', error)
      } finally {
        loading.value = false
      }
    }

    const getStatusType = (status) => {
      switch (status) {
      case 'completed': return 'success'
      case 'running': return 'warning'
      case 'failed': return 'danger'
      case 'pending': return 'info'
      default: return 'info'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
      case 'completed': return '已完成'
      case 'running': return '运行中'
      case 'failed': return '失败'
      case 'pending': return '等待中'
      default: return '未知'
      }
    }

    const getGeneType = (geneClass) => {
      switch (geneClass) {
      case 'beta-lactam': return 'danger'
      case 'fluoroquinolone': return 'warning'
      case 'aminoglycoside': return 'info'
      case 'macrolide': return 'success'
      case 'tetracycline': return 'primary'
      default: return ''
      }
    }

    const startAnalysis = () => {
      console.log('开始耐药基因分析')
    }

    const batchAnalysis = () => {
      console.log('批量耐药基因分析')
    }

    const viewDatabase = () => {
      console.log('查看耐药基因数据库')
    }

    const submitAnalysis = async () => {
      try {
        console.log('提交耐药基因分析任务:', resistanceForm)
        ElMessage.success('耐药基因分析任务提交成功')
        loadResistanceResults()
      } catch (error) {
        console.error('提交耐药基因分析任务失败:', error)
        ElMessage.error('提交耐药基因分析任务失败')
      }
    }

    const resetForm = () => {
      resistanceForm.genomeId = ''
      resistanceForm.databases = ['card', 'resfinder']
      resistanceForm.antibiotics = ['beta-lactam', 'fluoroquinolone']
      resistanceForm.minCoverage = 90
      resistanceForm.minIdentity = 80
    }

    const viewResult = (result) => {
      console.log('查看耐药基因结果:', result)
    }

    const downloadResult = (result) => {
      console.log('下载耐药基因结果:', result)
    }

    onMounted(() => {
      loadGenomes()
      loadResistanceResults()
    })

    return {
      loading,
      genomes,
      resistanceResults,
      resistanceForm,
      getStatusType,
      getStatusText,
      getGeneType,
      startAnalysis,
      batchAnalysis,
      viewDatabase,
      submitAnalysis,
      resetForm,
      viewResult,
      downloadResult
    }
  }
}
</script>

<style scoped>
.resistance-container {
  padding: 0;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.page-header p {
  margin: 0;
  color: #606266;
}

.content-area {
  background: transparent;
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
}

.resistance-form {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.results-section {
  margin-top: 20px;
}

.results-section h3 {
  margin-bottom: 15px;
  color: #303133;
}

.el-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
