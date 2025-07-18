<template>
  <div class="strains-container">
    <div class="page-header">
      <h1>菌株管理</h1>
      <p>管理和查看菌株信息</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button
          type="primary"
          @click="addStrain"
          v-if="canUpload"
        >
          <el-icon><Plus /></el-icon>
          添加菌株
        </el-button>
        <el-button
          @click="importStrains"
          v-if="canUpload"
        >
          <el-icon><Upload /></el-icon>
          导入菌株
        </el-button>
        <el-button @click="exportStrains">
          <el-icon><Download /></el-icon>
          导出菌株
        </el-button>
        <el-button
          type="danger"
          @click="batchDelete"
          v-if="canUpload && selectedStrains.length > 0"
        >
          <el-icon><Delete /></el-icon>
          批量删除 ({{ selectedStrains.length }})
        </el-button>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
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
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in speciesOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="地区">
            <el-select
              v-model="filterForm.region"
              placeholder="请选择地区"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in regionOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="样本来源">
            <el-select
              v-model="filterForm.sample_source"
              placeholder="请选择样本来源"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option
                v-for="option in sourceOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchStrains">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="strains"
          v-loading="loading"
          border
          style="width: 100%"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            type="selection"
            width="55"
            :selectable="(row) => canUpload"
          />
          <el-table-column prop="strain_id" label="菌株编号" width="120" />
          <el-table-column prop="species" label="菌种（属）" width="120" />
          <el-table-column prop="sample_id" label="样本编号" width="120" />
          <el-table-column prop="sample_source" label="样本来源" width="100" />
          <el-table-column prop="region" label="地区" width="100" />
          <el-table-column prop="onset_date" label="发病日期" width="100" />
          <el-table-column prop="sampling_date" label="采样日期" width="100" />
          <el-table-column prop="isolation_date" label="分离日期" width="100" />
          <el-table-column prop="uploaded_by" label="上传用户" width="100" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="viewStrain(scope.row)">
                查看
              </el-button>
              <el-button
                size="small"
                type="warning"
                @click="editStrain(scope.row)"
                v-if="canUpload"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="deleteStrain(scope.row)"
                v-if="canUpload"
              >
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

    <!-- 文件导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入菌株数据"
      width="800px"
    >
      <div class="import-steps">
        <el-steps :active="importStep" finish-status="success">
          <el-step title="选择文件" description="支持xlsx、csv、tsv格式"></el-step>
          <el-step title="字段映射" description="设置文件字段对应关系"></el-step>
          <el-step title="数据验证" description="验证数据格式和安全性"></el-step>
          <el-step title="导入完成" description="导入菌株数据"></el-step>
        </el-steps>
      </div>

      <!-- 第一步：选择文件 -->
      <div v-if="importStep === 0" class="import-step-content">
        <div class="file-upload-area">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
            accept=".xlsx,.csv,.tsv"
            drag
          >
            <div class="upload-content">
              <el-icon class="el-icon--upload"><Upload /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击选择文件</em>
              </div>
              <div class="el-upload__tip">
                支持 Excel (.xlsx)、CSV (.csv) 和 TSV (.tsv) 格式
              </div>
            </div>
          </el-upload>
          <div v-if="selectedFile" class="selected-file">
            <div class="file-info">
              <el-icon><Document /></el-icon>
              <span>{{ selectedFile.name }}</span>
              <el-button text @click="clearFile">
                <el-icon><Close /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二步：字段映射 -->
      <div v-if="importStep === 1" class="import-step-content">
        <div class="field-mapping">
          <h4>字段映射设置</h4>
          <p>请设置文件中的字段与系统字段的对应关系：</p>
          <el-table :data="fieldMappingData" border>
            <el-table-column prop="systemField" label="系统字段" width="150">
              <template #default="scope">
                <strong>{{ scope.row.systemFieldLabel }}</strong>
                <span v-if="scope.row.required" class="required">*</span>
              </template>
            </el-table-column>
            <el-table-column label="文件字段" width="200">
              <template #default="scope">
                <el-select
                  v-model="scope.row.fileField"
                  placeholder="请选择文件字段"
                  clearable
                >
                  <el-option
                    v-for="field in fileFields"
                    :key="field"
                    :label="field"
                    :value="field"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" />
          </el-table>
        </div>
      </div>

      <!-- 第三步：数据验证 -->
      <div v-if="importStep === 2" class="import-step-content">
        <div class="data-validation">
          <h4>数据验证结果</h4>
          <div class="validation-summary">
            <div class="summary-item">
              <span class="label">总记录数：</span>
              <span class="value">{{ importData.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">有效记录：</span>
              <span class="value success">{{ validRecords.length }}</span>
            </div>
            <div class="summary-item">
              <span class="label">错误记录：</span>
              <span class="value error">{{ errorRecords.length }}</span>
            </div>
          </div>

          <div v-if="errorRecords.length > 0" class="error-list">
            <h5>错误记录详情：</h5>
            <el-table :data="errorRecords" border max-height="300">
              <el-table-column prop="rowIndex" label="行号" width="80" />
              <el-table-column prop="field" label="字段" width="120" />
              <el-table-column prop="value" label="值" width="120" />
              <el-table-column prop="error" label="错误信息" />
            </el-table>
          </div>
        </div>
      </div>

      <!-- 第四步：导入完成 -->
      <div v-if="importStep === 3" class="import-step-content">
        <div class="import-result">
          <div class="result-icon">
            <el-icon size="60" color="#67c23a"><CircleCheck /></el-icon>
          </div>
          <h4>导入完成</h4>
          <p>成功导入 {{ importedCount }} 条菌株记录</p>
        </div>
      </div>

      <template #footer>
        <div class="import-dialog-footer">
          <el-button @click="importDialogVisible = false">取消</el-button>
          <el-button v-if="importStep > 0" @click="prevStep">上一步</el-button>
          <el-button
            v-if="importStep < 3"
            type="primary"
            @click="nextStep"
            :disabled="!canNextStep"
          >
            {{ importStep === 2 ? '开始导入' : '下一步' }}
          </el-button>
          <el-button
            v-if="importStep === 3"
            type="primary"
            @click="finishImport"
          >
            完成
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 菌株详情/编辑对话框 -->
    <el-dialog
      v-model="strainDialogVisible"
      :title="dialogTitle"
      width="800px"
      @close="closeDialog"
    >
      <el-tabs v-model="activeTab" type="card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form
            ref="basicFormRef"
            :model="strainForm.basic"
            :rules="basicFormRules"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="菌株编号" prop="strain_id">
                  <el-input
                    v-model="strainForm.basic.strain_id"
                    placeholder="请输入菌株编号"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="菌种（属）" prop="species">
                  <DropdownInput
                    v-model="strainForm.basic.species"
                    :options="speciesOptions"
                    placeholder="请选择或输入菌种"
                    :disabled="!isEditMode"
                    @change="handleSpeciesChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="样本编号" prop="sample_id">
                  <el-input
                    v-model="strainForm.basic.sample_id"
                    placeholder="请输入样本编号"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="样本来源" prop="sample_source">
                  <DropdownInput
                    v-model="strainForm.basic.sample_source"
                    :options="sourceOptions"
                    placeholder="请选择或输入样本来源"
                    :disabled="!isEditMode"
                    @change="handleSourceChange"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="地区" prop="region">
                  <DropdownInput
                    v-model="strainForm.basic.region"
                    :options="regionOptions"
                    placeholder="请选择或输入地区"
                    :disabled="!isEditMode"
                    @change="handleRegionChange"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="发病日期" prop="onset_date">
                  <el-date-picker
                    v-model="strainForm.basic.onset_date"
                    type="date"
                    placeholder="选择发病日期"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="采样日期" prop="sampling_date">
                  <el-date-picker
                    v-model="strainForm.basic.sampling_date"
                    type="date"
                    placeholder="选择采样日期"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="分离日期" prop="isolation_date">
                  <el-date-picker
                    v-model="strainForm.basic.isolation_date"
                    type="date"
                    placeholder="选择分离日期"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="上传用户" prop="uploaded_by">
                  <el-input
                    v-model="strainForm.basic.uploaded_by"
                    placeholder="上传用户"
                    disabled
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <!-- 特征信息 -->
        <el-tab-pane label="特征信息" name="characteristics">
          <el-form
            ref="characteristicsFormRef"
            :model="strainForm.characteristics"
            :rules="characteristicsFormRules"
            label-width="120px"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="毒力基因" prop="virulence_genes">
                  <el-input
                    v-model="strainForm.characteristics.virulence_genes"
                    placeholder="请输入毒力基因"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="耐药谱" prop="antibiotic_resistance">
                  <el-input
                    v-model="strainForm.characteristics.antibiotic_resistance"
                    placeholder="请输入耐药谱"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="ST型别" prop="st_type">
                  <el-input
                    v-model="strainForm.characteristics.st_type"
                    placeholder="请输入ST型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="血清型别" prop="serotype">
                  <el-input
                    v-model="strainForm.characteristics.serotype"
                    placeholder="请输入血清型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="分子血清型别" prop="molecular_serotype">
                  <el-input
                    v-model="strainForm.characteristics.molecular_serotype"
                    placeholder="请输入分子血清型别"
                    :disabled="!isEditMode"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="strainDialogVisible = false">
            {{ isEditMode ? '取消' : '关闭' }}
          </el-button>
          <el-button
            type="primary"
            @click="saveStrain"
            v-if="isEditMode"
          >
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Delete, Document, Close, CircleCheck } from '@element-plus/icons-vue'
import DropdownInput from '@/components/DropdownInput.vue'

export default {
  name: 'Strains',
  components: {
    Plus,
    Upload,
    Download,
    Delete,
    Document,
    Close,
    CircleCheck,
    DropdownInput
  },
  setup () {
    const store = useStore()
    const loading = ref(false)
    const strains = ref([])
    const selectedStrains = ref([])

    // 导入相关数据
    const importDialogVisible = ref(false)
    const importStep = ref(0)
    const selectedFile = ref(null)
    const fileFields = ref([])
    const importData = ref([])
    const validRecords = ref([])
    const errorRecords = ref([])
    const importedCount = ref(0)
    const uploadRef = ref(null)

    // 字段映射配置
    const fieldMappingData = ref([
      { systemField: 'strain_id', systemFieldLabel: '菌株编号', fileField: '', required: true, description: '唯一标识菌株的编号' },
      { systemField: 'species', systemFieldLabel: '菌种类型', fileField: '', required: true, description: '菌种类型' },
      { systemField: 'sample_id', systemFieldLabel: '样本编号', fileField: '', required: true, description: '样本的唯一编号' },
      { systemField: 'sample_source', systemFieldLabel: '样本来源', fileField: '', required: true, description: '样本的来源类型' },
      { systemField: 'region', systemFieldLabel: '采集地区', fileField: '', required: true, description: '地理位置' },
      { systemField: 'onset_date', systemFieldLabel: '发病时间', fileField: '', required: false, description: '发病的时间' },
      { systemField: 'sampling_date', systemFieldLabel: '采样时间', fileField: '', required: false, description: '采样的时间' },
      { systemField: 'isolation_date', systemFieldLabel: '分离时间', fileField: '', required: true, description: '分离的时间' },
      { systemField: 'st_type', systemFieldLabel: 'ST型', fileField: '', required: false, description: '序列分型' },
      { systemField: 'serotype', systemFieldLabel: '血清型', fileField: '', required: false, description: '血清分型' },
      { systemField: 'virulence_genes', systemFieldLabel: '毒力基因', fileField: '', required: false, description: '毒力基因信息' },
      { systemField: 'antibiotic_resistance', systemFieldLabel: '耐药谱', fileField: '', required: false, description: '抗生素耐药性' },
      { systemField: 'molecular_serotype', systemFieldLabel: '分子血清型', fileField: '', required: false, description: '分子血清分型' }
    ])

    const filterForm = reactive({
      strain_id: '',
      species: '',
      region: '',
      sample_source: ''
    })

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    // 对话框相关
    const strainDialogVisible = ref(false)
    const isEditMode = ref(false)
    const activeTab = ref('basic')
    const basicFormRef = ref(null)
    const characteristicsFormRef = ref(null)

    const strainForm = reactive({
      basic: {
        id: null,
        strain_id: '',
        species: '',
        sample_id: '',
        sample_source: '',
        region: '',
        onset_date: '',
        sampling_date: '',
        isolation_date: '',
        uploaded_by: '',
        created_at: ''
      },
      characteristics: {
        virulence_genes: '',
        antibiotic_resistance: '',
        st_type: '',
        serotype: '',
        molecular_serotype: ''
      }
    })

    const basicFormRules = {
      strain_id: [
        { required: true, message: '请输入菌株编号', trigger: 'blur' }
      ],
      species: [
        { required: true, message: '请选择菌种', trigger: 'change' }
      ],
      sample_id: [
        { required: true, message: '请输入样本编号', trigger: 'blur' }
      ],
      sample_source: [
        { required: true, message: '请选择样本来源', trigger: 'change' }
      ],
      region: [
        { required: true, message: '请选择地区', trigger: 'change' }
      ],
      isolation_date: [
        { required: true, message: '请选择分离日期', trigger: 'change' }
      ]
    }

    const characteristicsFormRules = {
      // 特征信息的验证规则可以根据需要添加
    }

    const dialogTitle = computed(() => {
      return isEditMode.value ? '编辑菌株' : '菌株详情'
    })

    const loadStrains = async () => {
      loading.value = true
      try {
        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API加载菌株数据
          const allStrains = await window.electronAPI.strains.getAll()
          strains.value = allStrains || []
          pagination.total = strains.value.length
        } else {
          // 开发环境或Web环境的模拟数据
          strains.value = [
            {
              id: 1,
              strain_id: 'E.coli-001',
              species: 'E.coli',
              sample_id: 'S001',
              sample_source: 'blood',
              region: 'beijing',
              onset_date: '2023-01-10',
              sampling_date: '2023-01-12',
              isolation_date: '2023-01-15',
              uploaded_by: 'admin'
            },
            {
              id: 2,
              strain_id: 'Salmonella-002',
              species: 'Salmonella',
              sample_id: 'S002',
              sample_source: 'feces',
              region: 'shanghai',
              onset_date: '2023-01-08',
              sampling_date: '2023-01-10',
              isolation_date: '2023-01-12',
              uploaded_by: 'advanced'
            }
          ]
          pagination.total = 2
        }
      } catch (error) {
        console.error('加载菌株数据失败:', error)
        ElMessage.error('加载菌株数据失败：' + error.message)
      } finally {
        loading.value = false
      }
    }

    const searchStrains = () => {
      pagination.current = 1
      loadStrains()
    }

    const resetFilter = () => {
      filterForm.strain_id = ''
      filterForm.species = ''
      filterForm.region = ''
      filterForm.sample_source = ''
      searchStrains()
    }

    const addStrain = () => {
      isEditMode.value = true
      activeTab.value = 'basic'
      resetStrainForm()
      strainForm.basic.uploaded_by = store.getters['auth/user'].username
      strainDialogVisible.value = true
    }

    const importStrains = () => {
      // 重置导入状态
      importStep.value = 0
      selectedFile.value = null
      fileFields.value = []
      importData.value = []
      validRecords.value = []
      errorRecords.value = []
      importedCount.value = 0

      // 重置字段映射
      fieldMappingData.value.forEach(field => {
        field.fileField = ''
      })

      importDialogVisible.value = true
    }

    const exportStrains = () => {
      // TODO: 实现导出菌株的逻辑
      console.log('导出菌株')
    }

    const viewStrain = (strain) => {
      isEditMode.value = false
      activeTab.value = 'basic'
      loadStrainToForm(strain)
      strainDialogVisible.value = true
    }

    const editStrain = (strain) => {
      isEditMode.value = true
      activeTab.value = 'basic'
      loadStrainToForm(strain)
      strainDialogVisible.value = true
    }

    const deleteStrain = async (strain) => {
      try {
        await ElMessageBox.confirm('确定要删除该菌株吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API删除
          await window.electronAPI.strains.delete(strain.id)
          ElMessage.success('删除成功')
          await loadStrains()
        } else {
          // 开发环境的内存删除
          const index = strains.value.findIndex(s => s.id === strain.id)
          if (index !== -1) {
            strains.value.splice(index, 1)
            pagination.total = strains.value.length
            ElMessage.success('删除成功')
          } else {
            ElMessage.error('菌株不存在')
          }
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除菌株失败:', error)
          ElMessage.error('删除失败：' + error.message)
        }
      }
    }

    // 选择相关方法
    const handleSelectionChange = (selection) => {
      selectedStrains.value = selection
    }

    const batchDelete = async () => {
      if (selectedStrains.value.length === 0) {
        ElMessage.warning('请先选择要删除的菌株')
        return
      }

      try {
        await ElMessageBox.confirm(
          `确定要删除选中的 ${selectedStrains.value.length} 个菌株吗？`,
          '批量删除提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API批量删除
          const deletePromises = selectedStrains.value.map(strain =>
            window.electronAPI.strains.delete(strain.id)
          )
          await Promise.all(deletePromises)
          ElMessage.success(`成功删除 ${selectedStrains.value.length} 个菌株`)
          selectedStrains.value = []
          await loadStrains()
        } else {
          // 开发环境的内存批量删除
          const idsToDelete = selectedStrains.value.map(strain => strain.id)
          strains.value = strains.value.filter(strain => !idsToDelete.includes(strain.id))
          pagination.total = strains.value.length
          ElMessage.success(`成功删除 ${selectedStrains.value.length} 个菌株`)
          selectedStrains.value = []
        }
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('批量删除失败')
        }
      }
    }

    // 导入相关方法
    const handleFileChange = (file) => {
      selectedFile.value = file
      parseFile(file)
    }

    const clearFile = () => {
      selectedFile.value = null
      fileFields.value = []
      if (uploadRef.value) {
        uploadRef.value.clearFiles()
      }
    }

    // 自动映射字段函数
    const autoMapFields = (headers) => {
      // 定义字段映射规则
      const fieldMappingRules = {
        strain_id: ['菌株编号', 'strain_id', 'strainid', '编号'],
        species: ['菌种类型', '菌种', 'species', '种类'],
        sample_id: ['样本编号', 'sample_id', 'sampleid', '样本号'],
        sample_source: ['样本来源', 'sample_source', '来源', '源'],
        region: ['采集地区', '地区', 'region', '地点', '位置'],
        onset_date: ['发病时间', '发病日期', 'onset_date', '发病'],
        sampling_date: ['采样时间', '采样日期', 'sampling_date', '采样'],
        isolation_date: ['分离时间', '分离日期', 'isolation_date', '分离'],
        st_type: ['ST型', 'st_type', 'st', 'ST'],
        serotype: ['血清型', 'serotype', '血清'],
        virulence_genes: ['毒力基因', 'virulence_genes', '毒力'],
        antibiotic_resistance: ['耐药谱', 'antibiotic_resistance', '耐药', '抗药性'],
        molecular_serotype: ['分子血清型', 'molecular_serotype', '分子血清']
      }

      fieldMappingData.value.forEach(field => {
        // 重置字段映射
        field.fileField = ''

        // 获取该字段的映射规则
        const rules = fieldMappingRules[field.systemField] || []

        // 尝试找到完全匹配的表头
        for (const rule of rules) {
          const exactMatch = headers.find(header => header === rule)
          if (exactMatch) {
            field.fileField = exactMatch
            return
          }
        }

        // 如果没有完全匹配，尝试模糊匹配
        const normalizeString = (str) => str.replace(/[\s()（）]/g, '').toLowerCase()

        for (const rule of rules) {
          const normalizedRule = normalizeString(rule)
          const fuzzyMatch = headers.find(header => {
            const normalizedHeader = normalizeString(header)
            return normalizedHeader === normalizedRule ||
                   normalizedHeader.includes(normalizedRule) ||
                   normalizedRule.includes(normalizedHeader)
          })

          if (fuzzyMatch) {
            field.fileField = fuzzyMatch
            return
          }
        }
      })
    }

    const parseFile = (file) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const data = e.target.result
        const extension = file.name.split('.').pop().toLowerCase()

        try {
          if (extension === 'csv') {
            parseCSV(data)
          } else if (extension === 'tsv') {
            parseTSV(data)
          } else if (extension === 'xlsx') {
            await parseExcel(data)
          }
        } catch (error) {
          ElMessage.error('文件解析失败：' + error.message)
        }
      }

      if (file.name.endsWith('.xlsx')) {
        reader.readAsArrayBuffer(file.raw)
      } else {
        reader.readAsText(file.raw)
      }
    }

    const parseCSV = (data) => {
      try {
        const lines = data.split('\n').filter(line => line.trim())
        if (lines.length < 2) {
          ElMessage.error('文件内容不足，至少需要标题行和数据行')
          return
        }

        // 改进的CSV解析，支持引号包围的字段
        const parseCSVLine = (line) => {
          const result = []
          let current = ''
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]

            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }

          result.push(current.trim())
          return result
        }

        // 解析表头
        const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''))
        fileFields.value = headers

        // 自动映射字段
        autoMapFields(headers)

        // 解析数据行
        const rows = lines.slice(1).map(line => {
          const values = parseCSVLine(line).map(v => v.replace(/"/g, ''))
          const row = {}
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          return row
        })

        importData.value = rows
        ElMessage.success(`解析成功，共 ${rows.length} 条记录`)
      } catch (error) {
        console.error('CSV解析失败:', error)
        ElMessage.error('CSV解析失败：' + error.message)
      }
    }

    const parseTSV = (data) => {
      const lines = data.split('\n').filter(line => line.trim())
      if (lines.length < 2) {
        ElMessage.error('文件内容不足，至少需要标题行和数据行')
        return
      }

      const headers = lines[0].split('\t').map(h => h.trim())
      fileFields.value = headers

      // 自动映射字段
      autoMapFields(headers)

      const rows = lines.slice(1).map(line => {
        const values = line.split('\t').map(v => v.trim())
        const row = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ''
        })
        return row
      })

      importData.value = rows
      ElMessage.success(`解析成功，共 ${rows.length} 条记录`)
    }

    const parseExcel = async (data) => {
      try {
        let XLSX

        // 尝试不同的方式导入xlsx库
        try {
          // 方法1: 动态导入
          XLSX = await import('xlsx')
        } catch (dynamicImportError) {
          console.warn('动态导入失败，尝试使用require:', dynamicImportError)
          try {
            // 方法2: 如果是Electron环境，尝试使用require
            if (window.require && typeof window.require === 'function') {
              XLSX = window.require('xlsx')
            } else {
              throw new Error('无法加载XLSX库')
            }
          } catch (requireError) {
            console.warn('require方式也失败:', requireError)
            throw new Error('XLSX库加载失败，请检查依赖安装')
          }
        }

        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]

        // 转换为JSON格式
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        if (jsonData.length < 2) {
          ElMessage.error('文件内容不足，至少需要标题行和数据行')
          return
        }

        // 获取表头（第一行）
        const headers = jsonData[0].filter(header => header && header.toString().trim())
        if (headers.length === 0) {
          ElMessage.error('未找到有效的表头信息')
          return
        }

        fileFields.value = headers

        // 自动映射字段
        autoMapFields(headers)

        // 处理数据行
        const rows = jsonData.slice(1).filter(row => row.some(cell => cell && cell.toString().trim())).map(row => {
          const rowData = {}
          headers.forEach((header, index) => {
            rowData[header] = row[index] ? row[index].toString().trim() : ''
          })
          return rowData
        })

        importData.value = rows
        ElMessage.success(`解析成功，共 ${rows.length} 条记录`)
      } catch (error) {
        console.error('Excel解析失败:', error)

        // 提供更详细的错误信息
        if (error.message.includes('Cannot resolve module') || error.message.includes('XLSX库加载失败')) {
          ElMessage.error('Excel解析库未能正确加载，请尝试使用CSV格式文件')
        } else if (error.message.includes('not defined') || error.message.includes('could not be created')) {
          ElMessage.error('文件解析失败，建议将Excel文件转换为CSV格式后导入')
        } else {
          ElMessage.error('Excel解析失败：' + error.message)
        }
      }
    }

    const canNextStep = computed(() => {
      switch (importStep.value) {
      case 0:
        return selectedFile.value && fileFields.value.length > 0
      case 1: {
        // 检查必填字段是否已映射
        const requiredFields = fieldMappingData.value.filter(field => field.required)
        return requiredFields.every(field => field.fileField)
      }
      case 2:
        return validRecords.value.length > 0
      default:
        return false
      }
    })

    const nextStep = async () => {
      try {
        if (importStep.value === 0) {
          // 进入字段映射步骤
          importStep.value = 1
        } else if (importStep.value === 1) {
          // 进入数据验证步骤
          validateData()
          importStep.value = 2
        } else if (importStep.value === 2) {
          // 开始导入
          await performImport()
          importStep.value = 3
        }
      } catch (error) {
        console.error('导入步骤失败:', error)
        // 保持在当前步骤，不前进
      }
    }

    const prevStep = () => {
      if (importStep.value > 0) {
        importStep.value--
      }
    }

    const validateData = () => {
      validRecords.value = []
      errorRecords.value = []

      importData.value.forEach((row, index) => {
        const errors = []
        const mappedData = {}

        // 检查必填字段
        const requiredFields = fieldMappingData.value.filter(field => field.required)
        requiredFields.forEach(field => {
          const fileField = field.fileField
          const value = row[fileField]

          if (!value || value.trim() === '') {
            errors.push({
              rowIndex: index + 2, // +2 因为有标题行，且从1开始计数
              field: field.systemFieldLabel,
              value: value || '',
              error: '必填字段不能为空'
            })
          } else {
            let processedValue = value

            // 特殊处理日期字段
            if (field.systemField.includes('date') || field.systemField.includes('time')) {
              // 尝试解析和标准化日期格式
              const dateValue = new Date(processedValue)
              if (!isNaN(dateValue.getTime())) {
                processedValue = dateValue.toISOString().split('T')[0] // YYYY-MM-DD格式
              }
            }

            mappedData[field.systemField] = processedValue
          }
        })

        // 检查可选字段
        const optionalFields = fieldMappingData.value.filter(field => !field.required)
        optionalFields.forEach(field => {
          const fileField = field.fileField
          if (fileField && row[fileField]) {
            let value = row[fileField]

            // 特殊处理日期字段
            if (field.systemField.includes('date') || field.systemField.includes('time')) {
              // 尝试解析和标准化日期格式
              const dateValue = new Date(value)
              if (!isNaN(dateValue.getTime())) {
                value = dateValue.toISOString().split('T')[0] // YYYY-MM-DD格式
              }
            }

            mappedData[field.systemField] = value
          }
        })

        // 检查菌株编号是否重复
        if (mappedData.strain_id) {
          const existingStrain = strains.value.find(strain => strain.strain_id === mappedData.strain_id)
          if (existingStrain) {
            errors.push({
              rowIndex: index + 2,
              field: '菌株编号',
              value: mappedData.strain_id,
              error: '菌株编号已存在'
            })
          }
        }

        if (errors.length > 0) {
          errorRecords.value.push(...errors)
        } else {
          // 处理日期格式转换，确保所有数据都是简单的字符串类型
          const processedData = {}

          // 1. 数据清理 - 确保所有值都是字符串
          Object.keys(mappedData).forEach(key => {
            const value = mappedData[key]
            if (value !== null && value !== undefined) {
              processedData[key] = String(value).trim()
            }
          })

          // 2. 安全的用户信息处理
          const user = store.getters['auth/user']
          processedData.uploaded_by = user && user.username ? String(user.username) : 'unknown'

          // 3. 数据处理完成，准备添加到记录中

          validRecords.value.push(processedData)
        }
      })
    }

    const performImport = async () => {
      try {
        if (window.electronAPI && window.electronAPI.strains) {
          // 创建完全可序列化的数据副本
          const serializableRecords = validRecords.value.map(record => {
            const cleanRecord = {}

            // 确保所有字段都是简单类型
            Object.keys(record).forEach(key => {
              const value = record[key]
              if (value !== null && value !== undefined) {
                let cleanValue = value

                // 转换为基本类型
                if (typeof value === 'string') {
                  // 清理字符串值，移除可能导致问题的字符
                  cleanValue = value.trim()
                } else if (typeof value === 'number' || typeof value === 'boolean') {
                  cleanValue = value
                } else {
                  // 对象或其他类型转换为字符串
                  cleanValue = String(value).trim()
                }

                // 只有非空值才添加
                if (cleanValue !== '') {
                  cleanRecord[key] = cleanValue
                }
              }
            })

            return cleanRecord
          })

          // 使用批量创建API提高效率
          try {
            const result = await window.electronAPI.strains.batchCreate(serializableRecords)

            if (result.success) {
              importedCount.value = result.created
              ElMessage.success(`成功导入 ${result.created} 条记录`)
            } else {
              ElMessage.warning(`导入完成，但有 ${result.errors.length} 条记录失败`)
              importedCount.value = result.created
            }
          } catch (batchError) {
            console.warn('批量导入失败，尝试逐条导入:', batchError)

            // 如果批量导入失败，回退到逐条导入
            const createPromises = serializableRecords.map(async (record, index) => {
              try {
                return await window.electronAPI.strains.create(record)
              } catch (error) {
                console.error(`创建菌株失败 (第${index + 1}条):`, error)
                throw new Error(`第${index + 1}条记录导入失败: ${error.message}`)
              }
            })

            const results = await Promise.allSettled(createPromises)

            // 统计成功和失败的数量
            const successful = results.filter(result => result.status === 'fulfilled')
            const failed = results.filter(result => result.status === 'rejected')

            importedCount.value = successful.length

            if (failed.length > 0) {
              console.warn('部分记录导入失败:', failed.map(f => f.reason.message))
              ElMessage.warning(`成功导入 ${successful.length} 条记录，${failed.length} 条记录失败`)
            } else {
              ElMessage.success(`成功导入 ${successful.length} 条记录`)
            }
          }

          await loadStrains()
        } else {
          // 开发环境的内存导入
          validRecords.value.forEach(record => {
            const strainData = {
              ...record,
              id: Date.now() + Math.random(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            strains.value.push(strainData)
          })
          pagination.total = strains.value.length
          importedCount.value = validRecords.value.length
        }
      } catch (error) {
        console.error('导入菌株失败:', error)
        ElMessage.error('导入失败：' + error.message)
        throw error
      }
    }

    const finishImport = () => {
      importDialogVisible.value = false
      loadStrains()
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      loadStrains()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadStrains()
    }

    // 对话框相关方法
    const resetStrainForm = () => {
      strainForm.basic.id = null
      strainForm.basic.strain_id = ''
      strainForm.basic.species = ''
      strainForm.basic.sample_id = ''
      strainForm.basic.sample_source = ''
      strainForm.basic.region = ''
      strainForm.basic.onset_date = ''
      strainForm.basic.sampling_date = ''
      strainForm.basic.isolation_date = ''
      strainForm.basic.uploaded_by = ''
      strainForm.basic.created_at = ''
      strainForm.characteristics.virulence_genes = ''
      strainForm.characteristics.antibiotic_resistance = ''
      strainForm.characteristics.st_type = ''
      strainForm.characteristics.serotype = ''
      strainForm.characteristics.molecular_serotype = ''
    }

    const loadStrainToForm = (strain) => {
      strainForm.basic.id = strain.id
      strainForm.basic.strain_id = strain.strain_id
      strainForm.basic.species = strain.species
      strainForm.basic.sample_id = strain.sample_id
      strainForm.basic.sample_source = strain.sample_source
      strainForm.basic.region = strain.region
      strainForm.basic.onset_date = strain.onset_date
      strainForm.basic.sampling_date = strain.sampling_date
      strainForm.basic.isolation_date = strain.isolation_date
      strainForm.basic.uploaded_by = strain.uploaded_by
      strainForm.basic.created_at = strain.created_at

      // 加载特征信息（这里需要根据实际数据结构调整）
      strainForm.characteristics.virulence_genes = strain.virulence_genes || ''
      strainForm.characteristics.antibiotic_resistance = strain.antibiotic_resistance || ''
      strainForm.characteristics.st_type = strain.st_type || ''
      strainForm.characteristics.serotype = strain.serotype || ''
      strainForm.characteristics.molecular_serotype = strain.molecular_serotype || ''
    }

    const closeDialog = () => {
      resetStrainForm()
      activeTab.value = 'basic'
    }

    const saveStrain = async () => {
      try {
        // 验证基本信息
        if (basicFormRef.value) {
          await basicFormRef.value.validate()
        }

        // 验证特征信息（如果有需要）
        if (characteristicsFormRef.value) {
          await characteristicsFormRef.value.validate()
        }

        // 准备菌株数据
        const strainData = {
          ...strainForm.basic,
          ...strainForm.characteristics
        }

        // 移除id字段（后端会自动生成）
        delete strainData.id
        delete strainData.created_at

        // 转换日期对象为字符串格式，避免数据库绑定错误
        if (strainData.onset_date instanceof Date) {
          strainData.onset_date = strainData.onset_date.toISOString().split('T')[0]
        }
        if (strainData.sampling_date instanceof Date) {
          strainData.sampling_date = strainData.sampling_date.toISOString().split('T')[0]
        }
        if (strainData.isolation_date instanceof Date) {
          strainData.isolation_date = strainData.isolation_date.toISOString().split('T')[0]
        }

        if (window.electronAPI && window.electronAPI.strains) {
          // 使用Electron API保存
          if (strainForm.basic.id) {
            // 更新现有菌株
            await window.electronAPI.strains.update(strainForm.basic.id, strainData)
            ElMessage.success('菌株更新成功')
          } else {
            // 添加新菌株
            await window.electronAPI.strains.create(strainData)
            ElMessage.success('菌株添加成功')
          }
        } else {
          // 开发环境的内存存储
          // 检查菌株编号是否重复
          const existingStrain = strains.value.find(strain =>
            strain.strain_id === strainForm.basic.strain_id &&
            strain.id !== strainForm.basic.id
          )
          if (existingStrain) {
            ElMessage.error('菌株编号已存在，请使用其他编号')
            return
          }

          const fullStrainData = {
            ...strainData,
            id: strainForm.basic.id || Date.now(),
            created_at: strainForm.basic.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          if (strainForm.basic.id) {
            // 更新现有菌株
            const index = strains.value.findIndex(strain => strain.id === strainForm.basic.id)
            if (index !== -1) {
              strains.value[index] = fullStrainData
            }
            ElMessage.success('菌株更新成功')
          } else {
            // 添加新菌株
            strains.value.push(fullStrainData)
            pagination.total = strains.value.length
            ElMessage.success('菌株添加成功')
          }
        }

        strainDialogVisible.value = false
        await loadStrains()
      } catch (error) {
        console.error('保存菌株失败:', error)
        if (error.message) {
          ElMessage.error(error.message)
        } else {
          ElMessage.error('保存失败，请检查表单信息')
        }
      }
    }

    // 系统配置选项
    const speciesOptions = computed(() => store.getters.activeSpeciesOptions)
    const regionOptions = computed(() => store.getters.activeRegionOptions)
    const sourceOptions = computed(() => store.getters.activeSourceOptions)

    // 处理选项变化，如果是新值则保存到系统配置
    const handleSpeciesChange = async (value) => {
      const existingOption = speciesOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveSpeciesOption', {
            value,
            label: value,
            description: '用户输入的菌种'
          })
        } catch (error) {
          console.error('保存菌种选项失败:', error)
        }
      }
    }

    const handleRegionChange = async (value) => {
      const existingOption = regionOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveRegionOption', {
            value,
            label: value,
            description: '用户输入的地区'
          })
        } catch (error) {
          console.error('保存地区选项失败:', error)
        }
      }
    }

    const handleSourceChange = async (value) => {
      const existingOption = sourceOptions.value.find(option => option.value === value)
      if (!existingOption && value && value.trim()) {
        try {
          await store.dispatch('saveSourceOption', {
            value,
            label: value,
            description: '用户输入的样本来源'
          })
        } catch (error) {
          console.error('保存样本来源选项失败:', error)
        }
      }
    }

    onMounted(async () => {
      // 并行加载菌株数据和系统配置
      await Promise.all([
        loadStrains(),
        store.dispatch('fetchSystemConfig')
      ])
    })

    // 权限控制
    const canUpload = computed(() => store.getters['auth/canUpload'])
    const isAdmin = computed(() => store.getters['auth/isAdmin'])

    return {
      loading,
      strains,
      selectedStrains,
      filterForm,
      pagination,
      searchStrains,
      resetFilter,
      addStrain,
      importStrains,
      exportStrains,
      viewStrain,
      editStrain,
      deleteStrain,
      handleSelectionChange,
      batchDelete,
      handleSizeChange,
      handleCurrentChange,
      canUpload,
      isAdmin,
      // 系统配置选项
      speciesOptions,
      regionOptions,
      sourceOptions,
      handleSpeciesChange,
      handleRegionChange,
      handleSourceChange,
      // 对话框相关
      strainDialogVisible,
      isEditMode,
      activeTab,
      basicFormRef,
      characteristicsFormRef,
      strainForm,
      basicFormRules,
      characteristicsFormRules,
      dialogTitle,
      closeDialog,
      saveStrain,
      // 导入相关
      importDialogVisible,
      importStep,
      selectedFile,
      fileFields,
      fieldMappingData,
      importData,
      validRecords,
      errorRecords,
      importedCount,
      uploadRef,
      handleFileChange,
      clearFile,
      canNextStep,
      nextStep,
      prevStep,
      finishImport
    }
  }
}
</script>

<style scoped>
.strains-container {
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
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
}

.toolbar .el-button {
  margin-right: 10px;
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

/* 导入对话框样式 */
.import-steps {
  margin-bottom: 30px;
}

.import-step-content {
  margin-top: 20px;
}

.file-upload-area {
  .upload-content {
    padding: 40px;
    text-align: center;
  }

  .selected-file {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    background-color: #f5f7fa;

    .file-info {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        flex: 1;
        margin-left: 10px;
      }
    }
  }
}

.field-mapping {
  h4 {
    margin-bottom: 10px;
    color: #303133;
  }

  p {
    margin-bottom: 20px;
    color: #606266;
  }

  .required {
    color: #f56c6c;
    margin-left: 5px;
  }
}

.data-validation {
  h4 {
    margin-bottom: 20px;
    color: #303133;
  }

  .validation-summary {
    display: flex;
    gap: 30px;
    margin-bottom: 20px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .summary-item {
      display: flex;
      align-items: center;
      gap: 10px;

      .label {
        font-weight: 500;
        color: #606266;
      }

      .value {
        font-weight: 600;
        font-size: 16px;

        &.success {
          color: #67c23a;
        }

        &.error {
          color: #f56c6c;
        }
      }
    }
  }

  .error-list {
    h5 {
      margin-bottom: 10px;
      color: #f56c6c;
    }
  }
}

.import-result {
  text-align: center;
  padding: 40px;

  .result-icon {
    margin-bottom: 20px;
  }

  h4 {
    margin-bottom: 10px;
    color: #303133;
  }

  p {
    color: #606266;
  }
}

.import-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
