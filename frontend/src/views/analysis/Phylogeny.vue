<template>
  <div class="phylogeny-container">
    <div class="page-header">
      <h2>系统发育分析</h2>
      <p>基因组进化关系和系统发育树的构建与分析</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="startAnalysis">
          <el-icon><Play /></el-icon>
          开始分析
        </el-button>
        <el-button @click="batchAnalysis">
          <el-icon><List /></el-icon>
          批量分析
        </el-button>
        <el-button @click="viewTree">
          <el-icon><Share /></el-icon>
          查看系统树
        </el-button>
      </div>

      <div class="phylogeny-form">
        <el-form :model="phylogenyForm" label-width="120px">
          <el-form-item label="选择基因组">
            <el-select
              v-model="phylogenyForm.genomeIds"
              placeholder="请选择要分析的基因组"
              multiple
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

          <el-form-item label="分析方法">
            <el-radio-group v-model="phylogenyForm.method">
              <el-radio label="core_snps">核心SNP</el-radio>
              <el-radio label="whole_genome">全基因组</el-radio>
              <el-radio label="mlst">MLST</el-radio>
              <el-radio label="cgmlst">cgMLST</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="进化模型">
            <el-select v-model="phylogenyForm.model" placeholder="请选择进化模型">
              <el-option label="JC69" value="jc69" />
              <el-option label="K80" value="k80" />
              <el-option label="F81" value="f81" />
              <el-option label="HKY85" value="hky85" />
              <el-option label="F84" value="f84" />
              <el-option label="GTR" value="gtr" />
            </el-select>
          </el-form-item>

          <el-form-item label="构树算法">
            <el-select v-model="phylogenyForm.algorithm" placeholder="请选择构树算法">
              <el-option label="邻接法 (NJ)" value="nj" />
              <el-option label="最大似然法 (ML)" value="ml" />
              <el-option label="贝叶斯法 (Bayes)" value="bayes" />
              <el-option label="最大简约法 (MP)" value="mp" />
            </el-select>
          </el-form-item>

          <el-form-item label="分析参数">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Bootstrap值">
                  <el-input-number
                    v-model="phylogenyForm.bootstrap"
                    :min="0"
                    :max="1000"
                    :step="100"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="外群选择">
                  <el-select
                    v-model="phylogenyForm.outgroup"
                    placeholder="选择外群"
                    clearable
                  >
                    <el-option
                      v-for="genome in genomes"
                      :key="genome.id"
                      :label="genome.name"
                      :value="genome.id"
                    />
                  </el-select>
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
        <h3>系统发育分析结果</h3>
        <el-table :data="phylogenyResults" v-loading="loading" border>
          <el-table-column prop="id" label="任务ID" width="80" />
          <el-table-column prop="name" label="分析名称" />
          <el-table-column prop="method" label="分析方法" />
          <el-table-column prop="genome_count" label="基因组数量" />
          <el-table-column prop="snp_count" label="SNP数量" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" />
          <el-table-column label="操作" width="250">
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
                type="info"
                @click="viewPhylogeneticTree(scope.row)"
                :disabled="scope.row.status !== 'completed'"
              >
                查看系统树
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

      <!-- 系统发育树可视化区域 -->
      <div v-if="showTree" class="tree-visualization">
        <h3>系统发育树</h3>
        <div class="tree-container">
          <div class="tree-toolbar">
            <el-button-group>
              <el-button size="small" @click="zoomIn">
                <el-icon><ZoomIn /></el-icon>
                放大
              </el-button>
              <el-button size="small" @click="zoomOut">
                <el-icon><ZoomOut /></el-icon>
                缩小
              </el-button>
              <el-button size="small" @click="resetZoom">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-button-group>
          </div>
          <div class="tree-canvas" id="phylogenetic-tree">
            <!-- 这里将来会集成 D3.js 或其他可视化库来显示系统发育树 -->
            <div class="tree-placeholder">
              <p>系统发育树将在这里显示</p>
              <p>需要集成 D3.js 或其他可视化库来实现</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { Play, List, Share, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'Phylogeny',
  components: {
    Play,
    List,
    Share,
    ZoomIn,
    ZoomOut,
    Refresh
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])
    const phylogenyResults = ref([])
    const showTree = ref(false)

    const phylogenyForm = reactive({
      genomeIds: [],
      method: 'core_snps',
      model: 'gtr',
      algorithm: 'ml',
      bootstrap: 1000,
      outgroup: ''
    })

    const loadGenomes = async () => {
      try {
        genomes.value = [
          { id: 1, name: 'E.coli-001-genome' },
          { id: 2, name: 'E.coli-002-genome' },
          { id: 3, name: 'E.coli-003-genome' },
          { id: 4, name: 'S.aureus-001-genome' },
          { id: 5, name: 'S.aureus-002-genome' }
        ]
      } catch (error) {
        console.error('加载基因组列表失败:', error)
      }
    }

    const loadPhylogenyResults = async () => {
      loading.value = true
      try {
        phylogenyResults.value = [
          {
            id: 1,
            name: '大肠杆菌系统发育分析',
            method: 'core_snps',
            genome_count: 3,
            snp_count: 1542,
            status: 'completed',
            created_at: '2023-01-15 10:30:00'
          },
          {
            id: 2,
            name: '金黄色葡萄球菌系统发育分析',
            method: 'whole_genome',
            genome_count: 2,
            snp_count: 2387,
            status: 'running',
            created_at: '2023-01-15 11:00:00'
          }
        ]
      } catch (error) {
        console.error('加载系统发育结果失败:', error)
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

    const startAnalysis = () => {
      console.log('开始系统发育分析')
    }

    const batchAnalysis = () => {
      console.log('批量系统发育分析')
    }

    const viewTree = () => {
      showTree.value = !showTree.value
    }

    const submitAnalysis = async () => {
      try {
        console.log('提交系统发育分析任务:', phylogenyForm)
        ElMessage.success('系统发育分析任务提交成功')
        loadPhylogenyResults()
      } catch (error) {
        console.error('提交系统发育分析任务失败:', error)
        ElMessage.error('提交系统发育分析任务失败')
      }
    }

    const resetForm = () => {
      phylogenyForm.genomeIds = []
      phylogenyForm.method = 'core_snps'
      phylogenyForm.model = 'gtr'
      phylogenyForm.algorithm = 'ml'
      phylogenyForm.bootstrap = 1000
      phylogenyForm.outgroup = ''
    }

    const viewResult = (result) => {
      console.log('查看系统发育结果:', result)
    }

    const viewPhylogeneticTree = (result) => {
      console.log('查看系统发育树:', result)
      showTree.value = true
    }

    const downloadResult = (result) => {
      console.log('下载系统发育结果:', result)
    }

    const zoomIn = () => {
      console.log('放大系统发育树')
    }

    const zoomOut = () => {
      console.log('缩小系统发育树')
    }

    const resetZoom = () => {
      console.log('重置系统发育树缩放')
    }

    onMounted(() => {
      loadGenomes()
      loadPhylogenyResults()
    })

    return {
      loading,
      genomes,
      phylogenyResults,
      phylogenyForm,
      showTree,
      getStatusType,
      getStatusText,
      startAnalysis,
      batchAnalysis,
      viewTree,
      submitAnalysis,
      resetForm,
      viewResult,
      viewPhylogeneticTree,
      downloadResult,
      zoomIn,
      zoomOut,
      resetZoom
    }
  }
}
</script>

<style scoped>
.phylogeny-container {
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

.phylogeny-form {
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

.tree-visualization {
  margin-top: 30px;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #dcdfe6;
}

.tree-visualization h3 {
  margin-bottom: 15px;
  color: #303133;
}

.tree-container {
  position: relative;
}

.tree-toolbar {
  margin-bottom: 15px;
  text-align: right;
}

.tree-canvas {
  min-height: 400px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background: #fafafa;
  position: relative;
}

.tree-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #909399;
}

.tree-placeholder p {
  margin: 10px 0;
  font-size: 14px;
}
</style>
