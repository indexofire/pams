<template>
  <div class="mlst-container">
    <div class="page-header">
      <h2>MLST分型</h2>
      <p>多位点序列分型（Multi-Locus Sequence Typing）分析</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="startMLST">
          <el-icon><VideoPlay /></el-icon>
          开始分析
        </el-button>
        <el-button @click="batchMLST">
          <el-icon><List /></el-icon>
          批量分析
        </el-button>
        <el-button @click="viewDatabase">
          <el-icon><DataBoard /></el-icon>
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
import { VideoPlay, List, DataBoard } from '@element-plus/icons-vue'

export default {
  name: 'MLST',
  components: {
    VideoPlay,
    List,
    DataBoard
  },
  setup () {
    const loading = ref(false)
    const genomes = ref([])
    const mlstResults = ref([])
    const schemes = ref([])
    const selectedGenomes = ref([])

    const mlstForm = reactive({
      genomeId: '',
      scheme: '',
      mode: 'auto',
      qcOptions: ['coverage', 'identity']
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

    const startMLST = async () => {
      if (!mlstForm.genomeId) {
        ElMessage.warning('请选择要分析的基因组')
        return
      }

      try {
        loading.value = true
        // 获取基因组文件路径
        const selectedGenome = genomes.value.find(g => g.id === mlstForm.genomeId)
        if (!selectedGenome) {
          throw new Error('未找到选择的基因组')
        }

        const genomeFiles = [selectedGenome.file_path]
        const options = {
          species: mlstForm.scheme,
          threshold: mlstForm.threshold
        }

        let results
        if (window.electronAPI && window.electronAPI.bioinformatics) {
          // 使用真实的生物信息学分析服务
          results = await window.electronAPI.bioinformatics.performMLSTAnalysis(genomeFiles, options)
          ElMessage.success('MLST分析完成')
        } else {
          // 浏览器环境下的模拟分析
          results = await simulateMLSTAnalysis(genomeFiles, options)
          ElMessage.success('MLST分析完成（模拟）')
        }

        // 添加到结果列表
        mlstResults.value.unshift({
          id: Date.now(),
          name: `MLST_${selectedGenome.name}_${new Date().toLocaleString()}`,
          genome_name: selectedGenome.name,
          scheme: mlstForm.scheme,
          sequence_type: results.genomes[0]?.sequenceType || 'Unknown',
          alleles: results.genomes[0]?.alleles || {},
          confidence: results.genomes[0]?.confidence || 0,
          status: 'completed',
          created_at: new Date().toLocaleString(),
          results
        })
      } catch (error) {
        console.error('MLST分析失败:', error)
        ElMessage.error('MLST分析失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const batchMLST = async () => {
      if (selectedGenomes.value.length === 0) {
        ElMessage.warning('请选择要分析的基因组')
        return
      }

      try {
        loading.value = true
        const genomeFiles = selectedGenomes.value.map(id => {
          const genome = genomes.value.find(g => g.id === id)
          return genome?.file_path
        }).filter(Boolean)

        const options = {
          species: mlstForm.scheme,
          threshold: mlstForm.threshold
        }

        let results
        if (window.electronAPI && window.electronAPI.bioinformatics) {
          results = await window.electronAPI.bioinformatics.performMLSTAnalysis(genomeFiles, options)
          ElMessage.success(`批量MLST分析完成，共分析 ${results.genomes.length} 个基因组`)
        } else {
          results = await simulateMLSTAnalysis(genomeFiles, options)
          ElMessage.success(`批量MLST分析完成（模拟），共分析 ${results.genomes.length} 个基因组`)
        }

        // 添加批量结果
        mlstResults.value.unshift({
          id: Date.now(),
          name: `Batch_MLST_${new Date().toLocaleString()}`,
          genome_name: `${results.genomes.length} genomes`,
          scheme: mlstForm.scheme,
          sequence_type: 'Multiple',
          status: 'completed',
          created_at: new Date().toLocaleString(),
          results
        })
      } catch (error) {
        console.error('批量MLST分析失败:', error)
        ElMessage.error('批量MLST分析失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    // 模拟MLST分析（浏览器环境）
    const simulateMLSTAnalysis = async (genomeFiles, options) => {
      // 模拟分析延迟
      await new Promise(resolve => setTimeout(resolve, 2000))

      const results = {
        analysisType: 'mlst',
        timestamp: new Date().toISOString(),
        genomes: [],
        summary: {
          totalGenomes: genomeFiles.length,
          typedGenomes: 0,
          novelAlleles: 0,
          novelSTs: 0
        }
      }

      for (const genomeFile of genomeFiles) {
        const genomeResult = {
          genomeFile: genomeFile.split('/').pop(),
          species: options.species,
          sequenceType: Math.floor(Math.random() * 500) + 1,
          isNovelST: Math.random() < 0.05,
          alleles: {
            adk: Math.floor(Math.random() * 100) + 1,
            fumC: Math.floor(Math.random() * 100) + 1,
            gyrB: Math.floor(Math.random() * 100) + 1,
            icd: Math.floor(Math.random() * 100) + 1,
            mdh: Math.floor(Math.random() * 100) + 1,
            purA: Math.floor(Math.random() * 100) + 1,
            recA: Math.floor(Math.random() * 100) + 1
          },
          novelAlleles: Math.floor(Math.random() * 3),
          confidence: 95 + Math.random() * 5
        }

        results.genomes.push(genomeResult)
        results.summary.typedGenomes++
        results.summary.novelAlleles += genomeResult.novelAlleles
        if (genomeResult.isNovelST) {
          results.summary.novelSTs++
        }
      }

      return results
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
      selectedGenomes,
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
