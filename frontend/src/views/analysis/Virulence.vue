<template>
  <div class="virulence-container">
    <div class="page-header">
      <h2>毒力基因分析</h2>
      <p>病原菌毒力因子和致病性基因的检测和分析</p>
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

      <div class="virulence-form">
        <el-form :model="virulenceForm" label-width="120px">
          <el-form-item label="选择基因组">
            <el-select
              v-model="virulenceForm.genomeId"
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
            <el-checkbox-group v-model="virulenceForm.databases">
              <el-checkbox label="vfdb">VFDB (毒力因子数据库)</el-checkbox>
              <el-checkbox label="victors">VICTORS</el-checkbox>
              <el-checkbox label="pathogen_host">Pathogen-Host</el-checkbox>
              <el-checkbox label="card_vir">CARD Virulence</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="毒力因子类型">
            <el-checkbox-group v-model="virulenceForm.virulenceTypes">
              <el-checkbox label="adhesion">黏附因子</el-checkbox>
              <el-checkbox label="invasion">侵入因子</el-checkbox>
              <el-checkbox label="toxin">毒素</el-checkbox>
              <el-checkbox label="secretion">分泌系统</el-checkbox>
              <el-checkbox label="immune_evasion">免疫逃逸</el-checkbox>
              <el-checkbox label="iron_uptake">铁摄取</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="分析参数">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="最小覆盖度">
                  <el-input-number
                    v-model="virulenceForm.minCoverage"
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
                    v-model="virulenceForm.minIdentity"
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
        <h3>毒力基因分析结果</h3>
        <el-table :data="virulenceResults" v-loading="loading" border>
          <el-table-column prop="id" label="任务ID" width="80" />
          <el-table-column prop="genome_name" label="基因组" />
          <el-table-column prop="gene_count" label="基因数量" />
          <el-table-column prop="virulence_genes" label="毒力基因" width="300">
            <template #default="scope">
              <el-tag
                v-for="gene in scope.row.virulence_genes.slice(0, 3)"
                :key="gene.name"
                :type="getGeneType(gene.type)"
                size="small"
                style="margin-right: 5px; margin-bottom: 5px;"
              >
                {{ gene.name }}
              </el-tag>
              <el-tag
                v-if="scope.row.virulence_genes.length > 3"
                size="small"
                type="info"
              >
                +{{ scope.row.virulence_genes.length - 3 }} 更多
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pathogenicity" label="致病性评分" width="120">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.pathogenicity"
                :color="getPathogenicityColor(scope.row.pathogenicity)"
                :stroke-width="12"
              />
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
  name: 'Virulence',
  components: {
    VideoPlay,
    List,
    DataBoard
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])
    const virulenceResults = ref([])

    const virulenceForm = reactive({
      genomeId: '',
      databases: ['vfdb', 'victors'],
      virulenceTypes: ['adhesion', 'toxin'],
      minCoverage: 90,
      minIdentity: 80
    })

    const loadGenomes = async () => {
      try {
        if (window.electronAPI && window.electronAPI.genomes) {
          const response = await window.electronAPI.genomes.getGenomes()
          genomes.value = response.genomes.map(genome => ({
            id: genome.id,
            name: genome.file_name,
            file_path: genome.file_path,
            species: genome.species,
            strain_id: genome.strain_id
          }))
        } else {
          // 浏览器环境模拟数据
          genomes.value = [
            { id: 1, name: 'E.coli-001-genome.fasta', file_path: '/mock/path/ecoli.fasta', species: 'Escherichia coli' },
            { id: 2, name: 'S.aureus-002-genome.fasta', file_path: '/mock/path/saureus.fasta', species: 'Staphylococcus aureus' },
            { id: 3, name: 'Salmonella-003-genome.fasta', file_path: '/mock/path/salmonella.fasta', species: 'Salmonella enterica' }
          ]
        }
      } catch (error) {
        console.error('加载基因组列表失败:', error)
        ElMessage.error('加载基因组列表失败')
      }
    }

    const loadVirulenceResults = async () => {
      loading.value = true
      try {
        virulenceResults.value = [
          {
            id: 1,
            genome_name: 'E.coli-001-genome',
            gene_count: 7,
            virulence_genes: [
              { name: 'fimH', type: 'adhesion' },
              { name: 'stx1', type: 'toxin' },
              { name: 'stx2', type: 'toxin' },
              { name: 'eae', type: 'adhesion' },
              { name: 'espA', type: 'secretion' },
              { name: 'iroN', type: 'iron_uptake' },
              { name: 'cnf1', type: 'toxin' }
            ],
            pathogenicity: 85,
            status: 'completed',
            created_at: '2023-01-15 10:30:00'
          },
          {
            id: 2,
            genome_name: 'S.aureus-002-genome',
            gene_count: 5,
            virulence_genes: [
              { name: 'hla', type: 'toxin' },
              { name: 'hlb', type: 'toxin' },
              { name: 'fnbA', type: 'adhesion' },
              { name: 'spa', type: 'immune_evasion' },
              { name: 'sdrD', type: 'adhesion' }
            ],
            pathogenicity: 78,
            status: 'completed',
            created_at: '2023-01-15 11:00:00'
          }
        ]
      } catch (error) {
        console.error('加载毒力基因结果失败:', error)
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

    const getGeneType = (geneType) => {
      switch (geneType) {
      case 'adhesion': return 'primary'
      case 'toxin': return 'danger'
      case 'invasion': return 'warning'
      case 'secretion': return 'info'
      case 'immune_evasion': return 'success'
      case 'iron_uptake': return ''
      default: return ''
      }
    }

    const getPathogenicityColor = (score) => {
      if (score >= 80) return '#f56c6c'
      if (score >= 60) return '#e6a23c'
      if (score >= 40) return '#409eff'
      return '#67c23a'
    }

    const startAnalysis = () => {
      console.log('开始毒力基因分析')
    }

    const batchAnalysis = () => {
      console.log('批量毒力基因分析')
    }

    const viewDatabase = () => {
      console.log('查看毒力基因数据库')
    }

    const submitAnalysis = async () => {
      try {
        console.log('提交毒力基因分析任务:', virulenceForm)
        ElMessage.success('毒力基因分析任务提交成功')
        loadVirulenceResults()
      } catch (error) {
        console.error('提交毒力基因分析任务失败:', error)
        ElMessage.error('提交毒力基因分析任务失败')
      }
    }

    const resetForm = () => {
      virulenceForm.genomeId = ''
      virulenceForm.databases = ['vfdb', 'victors']
      virulenceForm.virulenceTypes = ['adhesion', 'toxin']
      virulenceForm.minCoverage = 90
      virulenceForm.minIdentity = 80
    }

    const viewResult = (result) => {
      console.log('查看毒力基因结果:', result)
    }

    const downloadResult = (result) => {
      console.log('下载毒力基因结果:', result)
    }

    onMounted(() => {
      loadGenomes()
      loadVirulenceResults()
    })

    return {
      loading,
      genomes,
      virulenceResults,
      virulenceForm,
      getStatusType,
      getStatusText,
      getGeneType,
      getPathogenicityColor,
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
.virulence-container {
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

.virulence-form {
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
