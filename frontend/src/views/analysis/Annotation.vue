<template>
  <div class="annotation-container">
    <div class="page-header">
      <h2>基因组注释</h2>
      <p>基因组序列的功能注释和预测</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="startAnnotation">
          <el-icon><VideoPlay /></el-icon>
          开始注释
        </el-button>
        <el-button @click="batchAnnotation">
          <el-icon><List /></el-icon>
          批量注释
        </el-button>
                 <el-button @click="viewResults">
           <el-icon><ViewIcon /></el-icon>
           查看结果
         </el-button>
      </div>

      <div class="annotation-form">
        <el-form :model="annotationForm" label-width="120px">
          <el-form-item label="选择基因组">
            <el-select
              v-model="annotationForm.genomeId"
              placeholder="请选择要注释的基因组"
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

          <el-form-item label="注释工具">
            <el-radio-group v-model="annotationForm.tool">
              <el-radio label="prokka">Prokka</el-radio>
              <el-radio label="rast">RAST</el-radio>
              <el-radio label="pgap">PGAP</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="物种类型">
            <el-select v-model="annotationForm.species" placeholder="请选择物种类型">
              <el-option label="细菌" value="bacteria" />
              <el-option label="古菌" value="archaea" />
              <el-option label="病毒" value="virus" />
            </el-select>
          </el-form-item>

          <el-form-item label="基因预测">
            <el-checkbox-group v-model="annotationForm.features">
              <el-checkbox label="cds">编码序列 (CDS)</el-checkbox>
              <el-checkbox label="rrna">rRNA</el-checkbox>
              <el-checkbox label="trna">tRNA</el-checkbox>
              <el-checkbox label="tmrna">tmRNA</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="数据库">
            <el-checkbox-group v-model="annotationForm.databases">
              <el-checkbox label="swiss">Swiss-Prot</el-checkbox>
              <el-checkbox label="trembl">TrEMBL</el-checkbox>
              <el-checkbox label="pfam">Pfam</el-checkbox>
              <el-checkbox label="cog">COG</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="submitAnnotation">提交注释任务</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="results-section">
        <h3>注释任务列表</h3>
        <el-table :data="annotationTasks" v-loading="loading" border>
          <el-table-column prop="id" label="任务ID" width="80" />
          <el-table-column prop="genome_name" label="基因组" />
          <el-table-column prop="tool" label="注释工具" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="150">
            <template #default="scope">
              <el-progress
                :percentage="scope.row.progress"
                :status="scope.row.status === 'failed' ? 'exception' : ''"
                size="small"
              />
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" />
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                size="small"
                @click="viewTaskDetail(scope.row)"
                :disabled="scope.row.status === 'running'"
              >
                查看详情
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="cancelTask(scope.row)"
                :disabled="scope.row.status !== 'running'"
              >
                取消
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
import { VideoPlay, List, View as ViewIcon } from '@element-plus/icons-vue'

export default {
  name: 'Annotation',
  components: {
    VideoPlay,
    List,
    ViewIcon
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])
    const annotationTasks = ref([])

    const annotationForm = reactive({
      genomeId: '',
      tool: 'prokka',
      species: 'bacteria',
      features: ['cds', 'rrna', 'trna'],
      databases: ['swiss', 'pfam']
    })

    const loadGenomes = async () => {
      try {
        // TODO: 实现从后端加载基因组列表的逻辑
        genomes.value = [
          { id: 1, name: 'E.coli-001-genome' },
          { id: 2, name: 'S.aureus-002-genome' }
        ]
      } catch (error) {
        console.error('加载基因组列表失败:', error)
      }
    }

    const loadAnnotationTasks = async () => {
      loading.value = true
      try {
        // TODO: 实现从后端加载注释任务的逻辑
        annotationTasks.value = [
          {
            id: 1,
            genome_name: 'E.coli-001-genome',
            tool: 'prokka',
            status: 'completed',
            progress: 100,
            created_at: '2023-01-15 10:30:00'
          },
          {
            id: 2,
            genome_name: 'S.aureus-002-genome',
            tool: 'rast',
            status: 'running',
            progress: 65,
            created_at: '2023-01-15 11:00:00'
          }
        ]
      } catch (error) {
        console.error('加载注释任务失败:', error)
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

    const startAnnotation = () => {
      // TODO: 实现开始注释的逻辑
      console.log('开始注释')
    }

    const batchAnnotation = () => {
      // TODO: 实现批量注释的逻辑
      console.log('批量注释')
    }

    const viewResults = () => {
      // TODO: 实现查看结果的逻辑
      console.log('查看结果')
    }

    const submitAnnotation = async () => {
      try {
        // TODO: 实现提交注释任务的逻辑
        console.log('提交注释任务:', annotationForm)
        ElMessage.success('注释任务提交成功')
        loadAnnotationTasks()
      } catch (error) {
        console.error('提交注释任务失败:', error)
        ElMessage.error('提交注释任务失败')
      }
    }

    const resetForm = () => {
      annotationForm.genomeId = ''
      annotationForm.tool = 'prokka'
      annotationForm.species = 'bacteria'
      annotationForm.features = ['cds', 'rrna', 'trna']
      annotationForm.databases = ['swiss', 'pfam']
    }

    const viewTaskDetail = (task) => {
      // TODO: 实现查看任务详情的逻辑
      console.log('查看任务详情:', task)
    }

    const cancelTask = (task) => {
      // TODO: 实现取消任务的逻辑
      console.log('取消任务:', task)
    }

    onMounted(() => {
      loadGenomes()
      loadAnnotationTasks()
    })

    return {
      loading,
      genomes,
      annotationTasks,
      annotationForm,
      getStatusType,
      getStatusText,
      startAnnotation,
      batchAnnotation,
      viewResults,
      submitAnnotation,
      resetForm,
      viewTaskDetail,
      cancelTask
    }
  }
}
</script>

<style scoped>
.annotation-container {
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

.annotation-form {
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
