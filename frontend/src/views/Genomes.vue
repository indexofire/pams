<template>
  <div class="genomes-container">
    <div class="page-header">
      <h1>基因组数据</h1>
      <p>管理和查看基因组序列数据</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button type="primary" @click="uploadGenome">
          <el-icon><Upload /></el-icon>
          上传基因组
        </el-button>
        <el-button @click="downloadGenomes">
          <el-icon><Download /></el-icon>
          批量下载
        </el-button>
        <el-button @click="syncGenomes">
          <el-icon><Refresh /></el-icon>
          同步数据
        </el-button>

        <!-- 浏览器环境显示存储使用情况 -->
        <div v-if="!isElectronEnv && storageUsage" class="storage-info">
          <el-tag type="info" size="small">
            存储使用: {{ storageUsage.percentage }}% ({{ formatSize(storageUsage.used) }} / {{ formatSize(storageUsage.available) }})
          </el-tag>
          <el-button v-if="storageUsage.percentage > 80" size="small" type="warning" @click="clearBrowserStorage">
            清理存储
          </el-button>
          <el-button size="small" type="danger" @click="cleanupCorruptedData">
            清理损坏数据
          </el-button>
        </div>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="基因组名称">
            <el-input
              v-model="filterForm.name"
              placeholder="请输入基因组名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="物种">
            <el-select
              v-model="filterForm.species"
              placeholder="请选择物种"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="species in availableSpecies"
                :key="species.id"
                :label="species.name"
                :value="species.name"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select
              v-model="filterForm.dataType"
              placeholder="请选择数据类型"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="完整基因组" value="complete" />
              <el-option label="草图基因组" value="draft" />
              <el-option label="转录组" value="transcriptome" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchGenomes">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="paginatedGenomes"
          v-loading="loading"
          border
          style="width: 100%"
        >
          <el-table-column prop="sequenceNumber" label="序号" width="80" />
          <el-table-column prop="strainName" label="菌株名称" min-width="120" />
          <el-table-column prop="originalName" label="数据文件" min-width="150" />
          <el-table-column prop="md5Hash" label="MD5校验值" min-width="120">
            <template #default="scope">
              <span v-if="scope.row.md5Hash" class="md5-hash">{{ scope.row.md5Hash.substring(0, 8) }}...</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="序列信息" min-width="120">
            <template #default="scope">
              <div v-if="scope.row.analysis">
                <div>序列数: {{ scope.row.analysis.totalSequences }}</div>
                <div>总长度: {{ formatSize(scope.row.analysis.summary.totalLength) }}</div>
              </div>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="GC含量" width="100">
            <template #default="scope">
              <span v-if="scope.row.analysis">{{ scope.row.analysis.summary.gcPercentage }}%</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="N50" width="100">
            <template #default="scope">
              <span v-if="scope.row.analysis">{{ formatSize(scope.row.analysis.summary.n50) }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="测序平台" width="120">
            <template #default="scope">
              <span>{{ scope.row.sequencingPlatform || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="组装软件" width="120">
            <template #default="scope">
              <span v-if="scope.row.assemblySoftware">
                {{ scope.row.assemblySoftware }}
                <span v-if="scope.row.assemblyVersion" class="version-text">
                  ({{ scope.row.assemblyVersion }})
                </span>
              </span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="质量" width="80">
            <template #default="scope">
              <el-tag
                v-if="scope.row.qualityReport"
                :type="getQualityTagType(scope.row.qualityReport.overall)"
                size="small"
              >
                {{ getQualityLabel(scope.row.qualityReport.overall) }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="uploadDate" label="上传日期" width="120">
            <template #default="scope">
              {{ formatDate(scope.row.uploadDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="250">
            <template #default="scope">
              <el-button size="small" @click="viewGenome(scope.row)">
                查看
              </el-button>
              <el-button size="small" type="success" @click="analyzeGenome(scope.row)">
                分析
              </el-button>
              <el-button size="small" type="warning" @click="downloadGenome(scope.row)">
                下载
              </el-button>
              <el-button size="small" type="danger" @click="deleteGenome(scope.row)">
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

    <!-- 基因组上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传基因组文件"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="upload-section">
        <el-upload
          ref="uploadRef"
          class="upload-demo"
          drag
          :action="uploadAction"
          :multiple="true"
          :auto-upload="false"
          :accept="acceptedFormats"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :file-list="fileList"
          :before-upload="beforeUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 .fasta, .fa, .fna, .gz 格式的基因组文件，单个文件不超过 100MB
            </div>
          </template>
        </el-upload>

        <div v-if="fileList.length > 0" class="file-association-section">
          <h4>文件关联设置</h4>
          <div v-for="(file, index) in fileList" :key="index" class="file-item">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">({{ formatFileSize(file.size) }})</span>
            </div>
            <div class="association-controls">
              <el-form-item label="关联菌株">
                <el-select
                  v-model="file.associatedStrain"
                  placeholder="选择关联的菌株"
                  filterable
                  clearable
                  style="width: 200px"
                >
                  <el-option
                    v-for="strain in availableStrains"
                    :key="strain.id"
                    :label="`${strain.strain_id} (${strain.species})`"
                    :value="strain.id"
                  />
                </el-select>
              </el-form-item>
              <el-button
                v-if="!file.associatedStrain"
                type="text"
                @click="autoAssociateStrain(file)"
              >
                自动关联
              </el-button>
            </div>

            <!-- 测序和组装信息 -->
            <div class="sequencing-info-section">
              <h5>测序和组装信息</h5>
              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="测序平台">
                    <el-select
                      v-model="file.sequencingPlatform"
                      placeholder="选择测序平台"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="Illumina" value="Illumina" />
                      <el-option label="PacBio" value="PacBio" />
                      <el-option label="Oxford Nanopore" value="Oxford Nanopore" />
                      <el-option label="Ion Torrent" value="Ion Torrent" />
                      <el-option label="BGI" value="BGI" />
                      <el-option label="其他" value="Other" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="测序模式">
                    <el-select
                      v-model="file.sequencingMode"
                      placeholder="选择测序模式"
                      clearable
                      style="width: 100%"
                    >
                      <el-option label="单端测序" value="Single-end" />
                      <el-option label="双端测序" value="Paired-end" />
                      <el-option label="长读长测序" value="Long-read" />
                      <el-option label="混合测序" value="Hybrid" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="组装软件">
                    <el-input
                      v-model="file.assemblySoftware"
                      placeholder="如: SPAdes, Canu, Flye"
                      clearable
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="软件版本">
                    <el-input
                      v-model="file.assemblyVersion"
                      placeholder="如: v3.15.4"
                      clearable
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="16">
                <el-col :span="12">
                  <el-form-item label="测序深度">
                    <el-input-number
                      v-model="file.sequencingDepth"
                      :min="0"
                      :precision="1"
                      placeholder="测序深度 (X)"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="N50值">
                    <el-input-number
                      v-model="file.n50Value"
                      :min="0"
                      placeholder="N50值 (bp)"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelUpload">取消</el-button>
          <el-button
            type="primary"
            :loading="uploading"
            :disabled="fileList.length === 0 || uploading"
            @click="startUpload"
          >
            {{ uploading ? '上传中...' : '开始上传' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 基因组分析结果对话框 -->
    <el-dialog
      v-model="analysisDialogVisible"
      title="基因组序列分析结果"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedGenome && selectedGenome.analysis" class="analysis-results">
        <el-tabs v-model="activeAnalysisTab">
          <el-tab-pane label="基本信息" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="文件名">{{ selectedGenome.originalName }}</el-descriptions-item>
              <el-descriptions-item label="序列总数">{{ selectedGenome.analysis.totalSequences }}</el-descriptions-item>
              <el-descriptions-item label="总长度">{{ formatSize(selectedGenome.analysis.summary.totalLength) }}</el-descriptions-item>
              <el-descriptions-item label="平均长度">{{ formatSize(selectedGenome.analysis.summary.averageLength) }}</el-descriptions-item>
              <el-descriptions-item label="最大长度">{{ formatSize(selectedGenome.analysis.summary.maxLength) }}</el-descriptions-item>
              <el-descriptions-item label="最小长度">{{ formatSize(selectedGenome.analysis.summary.minLength) }}</el-descriptions-item>
              <el-descriptions-item label="GC含量">{{ selectedGenome.analysis.summary.gcPercentage }}%</el-descriptions-item>
              <el-descriptions-item label="N含量">{{ selectedGenome.analysis.summary.nPercentage }}%</el-descriptions-item>
              <el-descriptions-item label="Contigs数量">{{ selectedGenome.analysis.summary.contigs }}</el-descriptions-item>
              <el-descriptions-item label="N50值">{{ formatSize(selectedGenome.analysis.summary.n50) }}</el-descriptions-item>
              <el-descriptions-item label="测序平台">{{ selectedGenome.sequencingPlatform || '-' }}</el-descriptions-item>
              <el-descriptions-item label="测序模式">{{ selectedGenome.sequencingMode || '-' }}</el-descriptions-item>
              <el-descriptions-item label="测序深度">{{ selectedGenome.sequencingDepth ? selectedGenome.sequencingDepth + 'X' : '-' }}</el-descriptions-item>
              <el-descriptions-item label="组装软件">{{ selectedGenome.assemblySoftware || '-' }}</el-descriptions-item>
              <el-descriptions-item label="软件版本">{{ selectedGenome.assemblyVersion || '-' }}</el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>

          <el-tab-pane label="质量报告" name="quality">
            <div v-if="selectedGenome.qualityReport">
              <el-alert
                :title="`总体质量: ${getQualityLabel(selectedGenome.qualityReport.overall)}`"
                :type="getQualityTagType(selectedGenome.qualityReport.overall)"
                :closable="false"
                style="margin-bottom: 20px;"
              />

              <div v-if="selectedGenome.qualityReport.issues.length > 0">
                <h4>发现的问题:</h4>
                <ul>
                  <li v-for="issue in selectedGenome.qualityReport.issues" :key="issue">{{ issue }}</li>
                </ul>
              </div>

              <div v-if="selectedGenome.qualityReport.recommendations.length > 0">
                <h4>改进建议:</h4>
                <ul>
                  <li v-for="rec in selectedGenome.qualityReport.recommendations" :key="rec">{{ rec }}</li>
                </ul>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="序列详情" name="sequences">
            <el-table :data="selectedGenome.analysis.sequences" border max-height="400">
              <el-table-column prop="id" label="序列ID" min-width="150" />
              <el-table-column label="长度" width="100">
                <template #default="scope">{{ formatSize(scope.row.length) }}</template>
              </el-table-column>
              <el-table-column prop="gcPercentage" label="GC%" width="80" />
              <el-table-column prop="atPercentage" label="AT%" width="80" />
              <el-table-column prop="nPercentage" label="N%" width="80" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="analysisDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="exportAnalysisReport">导出报告</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { Upload, Download, Refresh, UploadFilled, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { analyzeFastaSequence, validateFastaFormat, formatAnalysisResults, generateQualityReport } from '@/utils/genomeAnalysis'
import browserStorage from '@/utils/browserStorage'
// import { useStore } from 'vuex' // 暂时不使用，但保留以备将来使用

export default {
  name: 'Genomes',
  components: {
    Upload,
    Download,
    Refresh,
    UploadFilled,
    Document
  },
  setup () {
    // const store = useStore() // 暂时不使用，但保留以备将来使用
    const loading = ref(false)
    const genomes = ref([])

    // 上传相关数据
    const uploadDialogVisible = ref(false)
    const uploading = ref(false)
    const fileList = ref([])
    const uploadRef = ref(null)
    const availableStrains = ref([])
    const availableSpecies = ref([])
    const uploadAction = '#' // 不使用自动上传
    const acceptedFormats = '.fasta,.fa,.fna,.gz'

    // 存储使用情况
    const storageUsage = ref(null)

    // 分析对话框相关数据
    const analysisDialogVisible = ref(false)
    const selectedGenome = ref(null)
    const activeAnalysisTab = ref('basic')

    const filterForm = reactive({
      name: '',
      species: '',
      dataType: ''
    })

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    // 生成流水号
    const generateSequenceNumber = (genomes) => {
      return genomes.map((genome, index) => {
        // 如果已经有strainName，直接使用；否则尝试从关联菌株获取
        let strainName = genome.strainName || '-'
        if ((!genome.strainName || genome.strainName === '-') && genome.strainId) {
          const associatedStrain = availableStrains.value.find(strain => strain.id === genome.strainId)
          strainName = associatedStrain ? associatedStrain.strain_id : '-'
        }

        return {
          ...genome,
          sequenceNumber: index + 1,
          strainName
        }
      })
    }

    // 分页数据计算属性
    const paginatedGenomes = computed(() => {
      const start = (pagination.current - 1) * pagination.size
      const end = start + pagination.size
      const genomesWithSequence = generateSequenceNumber(genomes.value)
      return genomesWithSequence.slice(start, end)
    })

    const loadGenomes = async () => {
      loading.value = true
      try {
        if (window.electronAPI && window.electronAPI.genomes) {
          // 使用Electron API加载基因组数据
          const allGenomes = await window.electronAPI.genomes.getAll()
          genomes.value = allGenomes || []
          pagination.total = genomes.value.length
        } else {
          // 浏览器环境：使用IndexedDB存储
          try {
            const allGenomes = await browserStorage.getAllGenomes()

            // 检查是否有解压缩错误的数据
            const corruptedGenomes = allGenomes.filter(genome => genome.error)
            if (corruptedGenomes.length > 0) {
              console.warn(`发现 ${corruptedGenomes.length} 个损坏的基因组数据`)
              ElMessage.warning(`发现 ${corruptedGenomes.length} 个损坏的基因组数据，建议清理`)

              // 询问用户是否清理损坏数据
              try {
                await ElMessageBox.confirm(
                  '检测到损坏的基因组数据，是否清理这些数据？',
                  '数据清理',
                  {
                    confirmButtonText: '清理',
                    cancelButtonText: '跳过',
                    type: 'warning'
                  }
                )

                // 用户确认清理
                const cleanedCount = await browserStorage.cleanupCorruptedGenomes()
                ElMessage.success(`已清理 ${cleanedCount} 个损坏的数据`)

                // 重新加载数据
                const cleanedGenomes = await browserStorage.getAllGenomes()
                genomes.value = cleanedGenomes || []
              } catch (cleanupError) {
                if (cleanupError !== 'cancel') {
                  console.error('清理数据失败:', cleanupError)
                }
                // 即使清理失败，也显示可用的数据
                genomes.value = allGenomes.filter(genome => !genome.error) || []
              }
            } else {
              genomes.value = allGenomes || []
            }

            pagination.total = genomes.value.length
          } catch (error) {
            console.warn('从IndexedDB加载基因组数据失败，使用模拟数据:', error)

            // 如果是字符串长度错误，提示用户清理数据
            if (error.message && error.message.includes('Invalid string length')) {
              ElMessage.error('基因组数据损坏，请清理浏览器存储数据')
            }

            // 如果IndexedDB失败，使用空数据
            genomes.value = []
            pagination.total = 0
          }
        }
      } catch (error) {
        console.error('加载基因组数据失败:', error)
        ElMessage.error('加载基因组数据失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }

    const searchGenomes = () => {
      pagination.current = 1
      loadGenomes()
    }

    const resetFilter = () => {
      filterForm.name = ''
      filterForm.species = ''
      filterForm.dataType = ''
      searchGenomes()
    }

    const uploadGenome = async () => {
      // 加载可用的菌株列表
      await loadAvailableStrains()
      uploadDialogVisible.value = true
    }

    const downloadGenomes = () => {
      // TODO: 实现批量下载基因组的逻辑
      console.log('批量下载基因组')
    }

    const syncGenomes = () => {
      // TODO: 实现同步基因组数据的逻辑
      console.log('同步基因组数据')
    }

    const viewGenome = (genome) => {
      selectedGenome.value = genome
      activeAnalysisTab.value = 'basic'
      analysisDialogVisible.value = true
    }

    const analyzeGenome = (genome) => {
      // TODO: 实现分析基因组的逻辑
      console.log('分析基因组:', genome)
    }

    const downloadGenome = (genome) => {
      // TODO: 实现下载基因组的逻辑
      console.log('下载基因组:', genome)
    }

    const deleteGenome = async (genome) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除基因组 "${genome.name}" 吗？此操作不可撤销。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (window.electronAPI && window.electronAPI.genomes) {
          // 使用Electron API删除
          await window.electronAPI.genomes.delete(genome.id)
        } else {
          // 浏览器环境：使用IndexedDB删除
          await browserStorage.deleteGenome(genome.id)
        }

        ElMessage.success('基因组删除成功')
        await loadGenomes() // 重新加载列表
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除基因组失败:', error)
          ElMessage.error('删除基因组失败')
        }
      }
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      pagination.current = 1 // 重置到第一页
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
    }

    // 加载可用菌株
    const loadAvailableStrains = async () => {
      try {
        if (window.electronAPI && window.electronAPI.strains) {
          const strains = await window.electronAPI.strains.getAll()
          availableStrains.value = strains || []
        } else {
          // 开发环境从localStorage获取
          const savedStrains = localStorage.getItem('pams_strains')
          if (savedStrains) {
            availableStrains.value = JSON.parse(savedStrains)
          } else {
            availableStrains.value = []
          }
        }
      } catch (error) {
        console.error('加载菌株列表失败:', error)
        ElMessage.error('加载菌株列表失败')
      }
    }

    // 加载可用菌种
    const loadAvailableSpecies = async () => {
      try {
        if (window.electronAPI && window.electronAPI.species) {
          const species = await window.electronAPI.species.getAll()
          availableSpecies.value = species || []
        } else {
          // 开发环境从localStorage获取
          const savedSpecies = localStorage.getItem('pams_species')
          if (savedSpecies) {
            availableSpecies.value = JSON.parse(savedSpecies)
          } else {
            availableSpecies.value = []
          }
        }
      } catch (error) {
        console.error('加载菌种列表失败:', error)
        ElMessage.error('加载菌种列表失败')
      }
    }

    // 加载存储使用情况
    const loadStorageUsage = async () => {
      if (!window.electronAPI) {
        try {
          const usage = await browserStorage.getStorageUsage()
          storageUsage.value = usage
        } catch (error) {
          console.warn('获取存储使用情况失败:', error)
        }
      }
    }

    // 清理浏览器存储
    const clearBrowserStorage = async () => {
      try {
        await ElMessageBox.confirm(
          '确定要清理所有浏览器存储的数据吗？这将删除所有基因组、菌株和分析结果数据。',
          '确认清理',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        await browserStorage.clearStorage()
        ElMessage.success('存储清理成功')

        // 重新加载数据
        await loadGenomes()
        await loadAvailableStrains()
        await loadAvailableSpecies()
        await loadStorageUsage()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清理存储失败:', error)
          ElMessage.error('清理存储失败')
        }
      }
    }

    // 文件变化处理
    const handleFileChange = (file, uploadFileList) => {
      // 验证文件格式
      const allowedExtensions = ['.fasta', '.fa', '.fna', '.gz']
      const fileName = file.name.toLowerCase()
      const isValidFormat = allowedExtensions.some(ext => fileName.endsWith(ext))

      if (!isValidFormat) {
        ElMessage.error(`不支持的文件格式: ${file.name}`)
        // 从文件列表中移除无效文件
        const index = uploadFileList.findIndex(f => f.uid === file.uid)
        if (index > -1) {
          uploadFileList.splice(index, 1)
        }
        return false
      }

      // 验证文件大小 (500MB)
      const maxSize = 500 * 1024 * 1024
      if (file.size > maxSize) {
        ElMessage.error(`文件过大: ${file.name}，最大支持500MB`)
        // 从文件列表中移除过大文件
        const index = uploadFileList.findIndex(f => f.uid === file.uid)
        if (index > -1) {
          uploadFileList.splice(index, 1)
        }
        return false
      }

      // 更新fileList引用
      fileList.value = uploadFileList

      // 添加自定义属性
      file.associatedStrain = null
      file.uploadStatus = 'pending'

      // 添加测序和组装信息字段
      file.sequencingPlatform = null
      file.sequencingMode = null
      file.assemblySoftware = null
      file.assemblyVersion = null
      file.sequencingDepth = null
      file.n50Value = null

      // 自动尝试关联菌株
      setTimeout(() => {
        autoAssociateStrain(file)
      }, 100)
    }

    // 文件移除处理
    const handleFileRemove = (file, uploadFileList) => {
      // 更新fileList引用
      fileList.value = uploadFileList
    }

    // 上传前验证
    const beforeUpload = (file) => {
      // 检查文件格式
      const allowedTypes = ['.fasta', '.fa', '.fna', '.gz']
      const fileName = file.name.toLowerCase()
      const isValidType = allowedTypes.some(type => fileName.endsWith(type))

      if (!isValidType) {
        ElMessage.error('只支持 .fasta, .fa, .fna, .gz 格式的文件')
        return false
      }

      // 检查文件大小 (100MB)
      const isValidSize = file.size / 1024 / 1024 < 100
      if (!isValidSize) {
        ElMessage.error('文件大小不能超过 100MB')
        return false
      }

      return false // 阻止自动上传，使用手动上传
    }

    // 计算文件MD5值
    const calculateMD5 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result
            const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
            resolve(hashHex)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })
    }

    // 自动关联菌株
    const autoAssociateStrain = (file) => {
      const fileName = file.name.toLowerCase()
      let bestMatch = null
      let bestScore = 0

      // 尝试从文件名中提取菌株信息
      for (const strain of availableStrains.value) {
        const strainId = strain.strain_id.toLowerCase()
        const sampleId = strain.sample_id ? strain.sample_id.toLowerCase() : ''

        let score = 0

        // 精确匹配菌株ID
        if (fileName.includes(strainId)) {
          score += 10
        }

        // 精确匹配样本ID
        if (sampleId && fileName.includes(sampleId)) {
          score += 8
        }

        // 模糊匹配：移除特殊字符后比较
        const cleanFileName = fileName.replace(/[_\-.]/g, '')
        const cleanStrainId = strainId.replace(/[_\-.]/g, '')
        const cleanSampleId = sampleId.replace(/[_\-.]/g, '')

        if (cleanFileName.includes(cleanStrainId)) {
          score += 5
        }

        if (cleanSampleId && cleanFileName.includes(cleanSampleId)) {
          score += 3
        }

        // 菌种匹配
        if (strain.species) {
          const species = strain.species.toLowerCase()
          if (fileName.includes(species.replace(/\s+/g, ''))) {
            score += 2
          }
        }

        if (score > bestScore) {
          bestScore = score
          bestMatch = strain
        }
      }

      if (bestMatch && bestScore >= 5) {
        file.associatedStrain = bestMatch.id
        ElMessage.success(`已自动关联菌株: ${bestMatch.strain_id} (匹配度: ${bestScore})`)
      } else if (bestMatch && bestScore > 0) {
        // 低匹配度时询问用户
        ElMessageBox.confirm(
          `找到可能匹配的菌株: ${bestMatch.strain_id}，是否关联？`,
          '确认关联',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'question'
          }
        ).then(() => {
          file.associatedStrain = bestMatch.id
          ElMessage.success(`已关联菌株: ${bestMatch.strain_id}`)
        }).catch(() => {
          ElMessage.info('已取消自动关联')
        })
      } else {
        ElMessage.warning('无法自动关联，请手动选择菌株')
      }
    }

    // 格式化文件大小
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // 开始上传
    const startUpload = async () => {
      // 检查所有文件是否都已关联菌株
      const unassociatedFiles = fileList.value.filter(file => !file.associatedStrain)
      if (unassociatedFiles.length > 0) {
        ElMessage.warning('请为所有文件关联菌株')
        return
      }

      uploading.value = true
      try {
        for (const file of fileList.value) {
          await uploadSingleFile(file)
        }

        ElMessage.success(`成功上传 ${fileList.value.length} 个基因组文件`)
        uploadDialogVisible.value = false
        fileList.value = []
        loadGenomes() // 重新加载基因组列表
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('上传失败：' + error.message)
      } finally {
        uploading.value = false
      }
    }

    // 上传单个文件
    const uploadSingleFile = async (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
          try {
            const content = e.target.result
            let fileName = file.name
            let isCompressed = false

            // 如果是gz文件，标记为压缩
            if (fileName.toLowerCase().endsWith('.gz')) {
              isCompressed = true
              fileName = fileName.replace(/\.gz$/, '')
            }

            // 验证FASTA格式
            if (!validateFastaFormat(content)) {
              throw new Error(`文件 ${file.name} 不是有效的FASTA格式`)
            }

            // 计算MD5校验值
            let md5Hash = null
            try {
              md5Hash = await calculateMD5(file)
              console.log(`${file.name} MD5校验值: ${md5Hash}`)
            } catch (md5Error) {
              console.warn('MD5计算失败:', md5Error)
              ElMessage.warning(`${file.name} MD5计算失败，但文件上传继续`)
            }

            // 分析序列
            let analysisResults = null
            let qualityReport = null
            try {
              analysisResults = analyzeFastaSequence(content)
              qualityReport = generateQualityReport(analysisResults)

              ElMessage.success(`${file.name} 序列分析完成: 发现 ${analysisResults.totalSequences} 个序列`)
            } catch (analysisError) {
              console.warn('序列分析失败:', analysisError)
              ElMessage.warning(`${file.name} 上传成功，但序列分析失败: ${analysisError.message}`)
            }

            // 生成新的文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
            const newFileName = `${timestamp}_${fileName}`

            // 生成流水号ID
            const newId = genomes.value.length > 0 ? Math.max(...genomes.value.map(g => g.id || 0)) + 1 : 1

            // 获取关联菌株的名称
            const associatedStrain = availableStrains.value.find(strain => strain.id === file.associatedStrain)
            const strainName = associatedStrain ? associatedStrain.strain_id : '-'

            const genomeData = {
              id: newId,
              name: newFileName,
              originalName: file.name,
              strainId: file.associatedStrain,
              strainName, // 使用实际的菌株名称
              size: file.size,
              content,
              isCompressed,
              uploadDate: new Date().toISOString(),
              status: 'uploaded',
              md5Hash, // 添加MD5校验值
              // 添加序列分析结果
              analysis: analysisResults,
              qualityReport,
              // 添加测序和组装信息
              sequencingPlatform: file.sequencingPlatform,
              sequencingMode: file.sequencingMode,
              assemblySoftware: file.assemblySoftware,
              assemblyVersion: file.assemblyVersion,
              sequencingDepth: file.sequencingDepth,
              n50Value: file.n50Value
            }

            if (window.electronAPI && window.electronAPI.genomes) {
              // 使用Electron API保存
              await window.electronAPI.genomes.create(genomeData)
            } else {
              // 浏览器环境：使用IndexedDB存储
              try {
                await browserStorage.saveGenome(genomeData)
              } catch (error) {
                console.error('保存到IndexedDB失败:', error)
                throw new Error('保存基因组数据失败: ' + error.message)
              }
            }

            resolve()
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () => {
          reject(new Error('文件读取失败'))
        }

        reader.readAsText(file.raw)
      })
    }

    // 取消上传
    const cancelUpload = () => {
      fileList.value = []
      uploadDialogVisible.value = false
    }

    // 格式化文件大小
    const formatSize = (bytes) => {
      if (!bytes || bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }

    // 格式化日期
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString()
    }

    // 获取质量标签类型
    const getQualityTagType = (quality) => {
      switch (quality) {
      case 'excellent': return 'success'
      case 'good': return 'success'
      case 'warning': return 'warning'
      case 'poor': return 'danger'
      default: return 'info'
      }
    }

    // 获取质量标签文本
    const getQualityLabel = (quality) => {
      switch (quality) {
      case 'excellent': return '优秀'
      case 'good': return '良好'
      case 'warning': return '警告'
      case 'poor': return '较差'
      default: return '未知'
      }
    }

    // 导出分析报告
    const exportAnalysisReport = () => {
      if (!selectedGenome.value || !selectedGenome.value.analysis) {
        ElMessage.warning('没有可导出的分析数据')
        return
      }

      try {
        const reportData = formatAnalysisResults(selectedGenome.value.analysis)
        const reportText = JSON.stringify(reportData, null, 2)

        const blob = new Blob([reportText], { type: 'application/json' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `${selectedGenome.value.originalName}_analysis_report.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        ElMessage.success('分析报告导出成功')
      } catch (error) {
        console.error('导出报告失败:', error)
        ElMessage.error('导出报告失败')
      }
    }

    // 清理损坏数据
    const cleanupCorruptedData = async () => {
      try {
        await ElMessageBox.confirm(
          '此操作将清理所有损坏的基因组数据，是否继续？',
          '清理损坏数据',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        loading.value = true
        const cleanedCount = await browserStorage.cleanupCorruptedGenomes()

        if (cleanedCount > 0) {
          ElMessage.success(`已清理 ${cleanedCount} 个损坏的数据`)
          // 重新加载数据
          await loadGenomes()
        } else {
          ElMessage.info('没有发现损坏的数据')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('清理数据失败:', error)
          ElMessage.error('清理数据失败: ' + error.message)
        }
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadGenomes()
      loadAvailableStrains()
      loadAvailableSpecies()
      loadStorageUsage()
    })

    return {
      loading,
      genomes,
      paginatedGenomes,
      filterForm,
      pagination,
      searchGenomes,
      resetFilter,
      uploadGenome,
      downloadGenomes,
      syncGenomes,
      viewGenome,
      analyzeGenome,
      downloadGenome,
      deleteGenome,
      handleSizeChange,
      handleCurrentChange,
      // 上传相关
      uploadDialogVisible,
      uploading,
      fileList,
      uploadRef,
      availableStrains,
      availableSpecies,
      uploadAction,
      acceptedFormats,
      loadAvailableStrains,
      loadAvailableSpecies,
      handleFileChange,
      handleFileRemove,
      beforeUpload,
      calculateMD5,
      autoAssociateStrain,
      formatFileSize,
      startUpload,
      cancelUpload,
      // 格式化和显示方法
      formatSize,
      formatDate,
      getQualityTagType,
      getQualityLabel,
      // 存储相关
      storageUsage,
      clearBrowserStorage,
      cleanupCorruptedData,
      // 分析对话框相关
      analysisDialogVisible,
      selectedGenome,
      activeAnalysisTab,
      exportAnalysisReport,
      // 环境检测
      isElectronEnv: !!(window.electronAPI && window.electronAPI.genomes)
    }
  }
}
</script>

<style scoped>
.genomes-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;

  h1 {
    margin: 0 0 10px 0;
    font-size: 28px;
    color: #303133;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toolbar .el-button {
  margin-right: 10px;
}

.storage-info {
  display: flex;
  align-items: center;
  gap: 10px;
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

/* 上传对话框样式 */
.upload-section {
  padding: 20px 0;
}

.file-association-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.file-association-section h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  margin-bottom: 10px;
  background: #f5f7fa;
  border-radius: 4px;
}

.file-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.file-name {
  margin-left: 8px;
  font-weight: 500;
  color: #303133;
}

.file-size {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}

.association-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.association-controls .el-form-item {
  margin-bottom: 0;
}

.sequencing-info-section {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;

  h5 {
    margin: 0 0 15px 0;
    color: #495057;
    font-weight: 600;
  }
}

.version-text {
  color: #6c757d;
  font-size: 12px;
}

.md5-hash {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
  background: #f5f5f5;
  padding: 2px 4px;
  border-radius: 2px;
}
</style>
