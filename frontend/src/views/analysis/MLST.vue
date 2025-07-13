<template>
  <div class="mlst-container">
    <div class="page-header">
      <h2>MLST分型</h2>
      <p>多位点序列分型（Multi-Locus Sequence Typing）分析</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="startMLST">
          <el-icon><Play /></el-icon>
          开始分析
        </el-button>
        <el-button @click="batchMLST">
          <el-icon><List /></el-icon>
          批量分析
        </el-button>
        <el-button @click="viewDatabase">
          <el-icon><Database /></el-icon>
          查看数据库
        </el-button>
      </div>

      <div class="mlst-form">
        <el-form :model="mlstForm" label-width="120px">
          <el-form-item label="选择基因组">
            <el-select
              v-model="mlstForm.genomeId"
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

          <el-form-item label="物种方案">
            <el-select
              v-model="mlstForm.scheme"
              placeholder="请选择MLST方案"
              @change="onSchemeChange"
            >
              <el-option
                v-for="scheme in schemes"
                :key="scheme.value"
                :label="scheme.label"
                :value="scheme.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="分析模式">
            <el-radio-group v-model="mlstForm.mode">
              <el-radio label="auto">自动检测</el-radio>
              <el-radio label="manual">手动选择</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="质量控制">
            <el-checkbox-group v-model="mlstForm.qcOptions">
              <el-checkbox label="coverage">覆盖度检查</el-checkbox>
              <el-checkbox label="identity">相似度检查</el-checkbox>
              <el-checkbox label="length">长度检查</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitMLST">提交分析任务</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="results-section">
        <h3>MLST分析结果</h3>
        <el-table :data="mlstResults" v-loading="loading" border>
          <el-table-column prop="id" label="任务ID" width="80" />
          <el-table-column prop="genome_name" label="基因组" />
          <el-table-column prop="scheme" label="方案" />
          <el-table-column prop="sequence_type" label="序列型 (ST)" />
          <el-table-column prop="alleles" label="等位基因谱" width="200">
            <template #default="scope">
              <el-tag
                v-for="allele in scope.row.alleles"
                :key="allele.locus"
                size="small"
                style="margin-right: 5px;"
              >
                {{ allele.locus }}: {{ allele.number }}
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
import { Play, List, Database } from '@element-plus/icons-vue'

export default {
  name: 'MLST',
  components: {
    Play,
    List,
    Database
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])
    const mlstResults = ref([])
    const schemes = ref([])

    const mlstForm = reactive({
      genomeId: '',
      scheme: '',
      mode: 'auto',
      qcOptions: ['coverage', 'identity']
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

    const loadSchemes = async () => {
      try {
        schemes.value = [
          { label: 'Escherichia coli', value: 'ecoli' },
          { label: 'Staphylococcus aureus', value: 'saureus' },
          { label: 'Salmonella enterica', value: 'senterica' },
          { label: 'Klebsiella pneumoniae', value: 'kpneumoniae' }
        ]
      } catch (error) {
        console.error('加载MLST方案失败:', error)
      }
    }

    const loadMLSTResults = async () => {
      loading.value = true
      try {
        mlstResults.value = [
          {
            id: 1,
            genome_name: 'E.coli-001-genome',
            scheme: 'ecoli',
            sequence_type: 'ST-131',
            alleles: [
              { locus: 'adk', number: '5' },
              { locus: 'fumC', number: '4' },
              { locus: 'gyrB', number: '12' },
              { locus: 'icd', number: '1' },
              { locus: 'mdh', number: '20' },
              { locus: 'purA', number: '8' },
              { locus: 'recA', number: '2' }
            ],
            status: 'completed',
            created_at: '2023-01-15 10:30:00'
          },
          {
            id: 2,
            genome_name: 'S.aureus-002-genome',
            scheme: 'saureus',
            sequence_type: 'ST-8',
            alleles: [
              { locus: 'arcC', number: '3' },
              { locus: 'aroE', number: '3' },
              { locus: 'glpF', number: '1' },
              { locus: 'gmk', number: '1' },
              { locus: 'pta', number: '4' },
              { locus: 'tpi', number: '4' },
              { locus: 'yqiL', number: '3' }
            ],
            status: 'completed',
            created_at: '2023-01-15 11:00:00'
          }
        ]
      } catch (error) {
        console.error('加载MLST结果失败:', error)
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

    const onSchemeChange = (value) => {
      console.log('选择方案:', value)
    }

    const startMLST = () => {
      console.log('开始MLST分析')
    }

    const batchMLST = () => {
      console.log('批量MLST分析')
    }

    const viewDatabase = () => {
      console.log('查看MLST数据库')
    }

    const submitMLST = async () => {
      try {
        console.log('提交MLST任务:', mlstForm)
        ElMessage.success('MLST任务提交成功')
        loadMLSTResults()
      } catch (error) {
        console.error('提交MLST任务失败:', error)
        ElMessage.error('提交MLST任务失败')
      }
    }

    const resetForm = () => {
      mlstForm.genomeId = ''
      mlstForm.scheme = ''
      mlstForm.mode = 'auto'
      mlstForm.qcOptions = ['coverage', 'identity']
    }

    const viewResult = (result) => {
      console.log('查看MLST结果:', result)
    }

    const downloadResult = (result) => {
      console.log('下载MLST结果:', result)
    }

    onMounted(() => {
      loadGenomes()
      loadSchemes()
      loadMLSTResults()
    })

    return {
      loading,
      genomes,
      mlstResults,
      schemes,
      mlstForm,
      getStatusType,
      getStatusText,
      onSchemeChange,
      startMLST,
      batchMLST,
      viewDatabase,
      submitMLST,
      resetForm,
      viewResult,
      downloadResult
    }
  }
}
</script>

<style scoped>
.mlst-container {
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

.mlst-form {
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
