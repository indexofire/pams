<template>
  <div class="experiment-settings-container">
    <div class="page-header">
      <h1>实验设置</h1>
      <p>管理实验相关的配置信息</p>
    </div>

    <div class="content-area">
      <!-- 实验相关设置区块 -->
      <div class="settings-section">
        <el-tabs v-model="activeTab" type="card" class="experiment-tabs">
          <!-- 菌种管理 -->
          <el-tab-pane label="菌种管理" name="species">
            <div class="species-management">
              <div class="toolbar">
                <el-button type="primary" @click="addSpecies">
                  <el-icon><Plus /></el-icon>
                  添加菌种
                </el-button>
              </div>

              <el-table
                :data="speciesOptions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="菌种名称" min-width="120" />
                <el-table-column prop="scientific_name" label="学名" width="180">
                  <template #default="scope">
                    <em>{{ scope.row.scientific_name }}</em>
                  </template>
                </el-table-column>
                <el-table-column prop="abbreviation" label="缩写" width="80" />
                <el-table-column prop="ncbi_txid" label="NCBI TXID" width="100">
                  <template #default="scope">
                    <span v-if="scope.row.ncbi_txid">
                      <a :href="`https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=${scope.row.ncbi_txid}`"
                         target="_blank"
                         style="color: #409eff; text-decoration: none;">
                        {{ scope.row.ncbi_txid }}
                      </a>
                    </span>
                    <span v-else style="color: #909399;">-</span>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="150" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editSpecies(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleSpeciesStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteSpecies(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 地区管理 -->
          <el-tab-pane label="地区管理" name="regions">
            <div class="region-management">
              <div class="toolbar">
                <el-button type="primary" @click="addRegion">
                  <el-icon><Plus /></el-icon>
                  添加地区
                </el-button>
              </div>

              <el-table
                :data="regionOptions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="地区名称" min-width="150" />
                <el-table-column prop="code" label="地区代码" width="120" />
                <el-table-column prop="level" label="级别" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.level === 'province' ? 'danger' : scope.row.level === 'city' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ scope.row.level === 'province' ? '省/直辖市' : scope.row.level === 'city' ? '市' : '区/县' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editRegion(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleRegionStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteRegion(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 样本来源管理 -->
          <el-tab-pane label="样本来源管理" name="sources">
            <div class="source-management">
              <div class="toolbar">
                <el-button type="primary" @click="addSource">
                  <el-icon><Plus /></el-icon>
                  添加样本来源
                </el-button>
              </div>

              <el-table
                :data="sourceOptions"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="来源名称" min-width="150" />
                <el-table-column prop="category" label="类别" width="120">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.category === 'clinical' ? 'danger' : scope.row.category === 'environmental' ? 'warning' : 'primary'"
                      size="small"
                    >
                      {{ scope.row.category === 'clinical' ? '临床' : scope.row.category === 'environmental' ? '环境' : '其他' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editSource(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleSourceStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteSource(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 实验类型管理 -->
          <el-tab-pane label="实验类型管理" name="experiments">
            <div class="experiment-management">
              <div class="toolbar">
                <el-button type="primary" @click="addExperiment">
                  <el-icon><Plus /></el-icon>
                  添加实验类型
                </el-button>
              </div>

              <el-table
                :data="experimentTypes"
                border
                style="width: 100%"
                :height="400"
                :table-layout="'fixed'"
              >
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="name" label="实验类型" min-width="150" />
                <el-table-column prop="description" label="描述" min-width="200" />
                <el-table-column prop="protocol" label="实验协议" min-width="200" />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag
                      :type="scope.row.status === 'active' ? 'success' : 'danger'"
                      size="small"
                    >
                      {{ scope.row.status === 'active' ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="editExperiment(scope.row)">编辑</el-button>
                    <el-button
                      size="small"
                      :type="scope.row.status === 'active' ? 'warning' : 'success'"
                      @click="toggleExperimentStatus(scope.row)"
                    >
                      {{ scope.row.status === 'active' ? '禁用' : '启用' }}
                    </el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteExperiment(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>

    <!-- 菌种编辑对话框 -->
    <el-dialog v-model="speciesDialogVisible" title="菌种管理" width="700px">
      <el-form :model="speciesForm" label-width="100px">
        <el-form-item label="菌种名称" required>
          <el-input v-model="speciesForm.name" placeholder="请输入菌种名称" />
        </el-form-item>
        <el-form-item label="学名" required>
          <el-input
            v-model="speciesForm.scientific_name"
            placeholder="请输入学名，如：Escherichia coli"
          />
        </el-form-item>
        <el-form-item label="缩写">
          <el-input
            v-model="speciesForm.abbreviation"
            placeholder="自动生成或手动输入"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="NCBI TXID">
          <el-input
            v-model="speciesForm.ncbi_txid"
            placeholder="从NCBI获取或手动输入"
            style="width: 200px;"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="speciesForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="speciesForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="speciesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecies">确定</el-button>
      </template>
    </el-dialog>

    <!-- 地区编辑对话框 -->
    <el-dialog v-model="regionDialogVisible" title="地区管理" width="600px">
      <el-form :model="regionForm" label-width="80px">
        <el-form-item label="地区名称">
          <el-input v-model="regionForm.name" placeholder="请输入地区名称" />
        </el-form-item>
        <el-form-item label="地区代码">
          <el-input v-model="regionForm.code" placeholder="请输入地区代码" />
        </el-form-item>
        <el-form-item label="级别">
          <el-select v-model="regionForm.level" placeholder="请选择级别">
            <el-option label="省/直辖市" value="province" />
            <el-option label="市" value="city" />
            <el-option label="区/县" value="district" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="regionForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="regionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRegion">确定</el-button>
      </template>
    </el-dialog>

    <!-- 样本来源编辑对话框 -->
    <el-dialog v-model="sourceDialogVisible" title="样本来源管理" width="600px">
      <el-form :model="sourceForm" label-width="80px">
        <el-form-item label="来源名称">
          <el-input v-model="sourceForm.name" placeholder="请输入样本来源名称" />
        </el-form-item>
        <el-form-item label="类别">
          <el-select v-model="sourceForm.category" placeholder="请选择类别">
            <el-option label="临床" value="clinical" />
            <el-option label="食品" value="food" />
            <el-option label="环境" value="environmental" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="sourceForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="sourceForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSource">确定</el-button>
      </template>
    </el-dialog>

    <!-- 实验类型编辑对话框 -->
    <el-dialog v-model="experimentDialogVisible" title="实验类型管理" width="600px">
      <el-form :model="experimentForm" label-width="80px">
        <el-form-item label="实验类型">
          <el-input v-model="experimentForm.name" placeholder="请输入实验类型名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="experimentForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="实验协议">
          <el-input v-model="experimentForm.protocol" type="textarea" :rows="5" placeholder="请输入实验协议" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="experimentForm.status" placeholder="请选择状态">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="experimentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveExperiment">确定</el-button>
      </template>
    </el-dialog>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
export default {
  name: 'ExperimentSettings',
  components: {
    Plus
  },
  setup () {
    const activeTab = ref('species')

    // 菌种管理相关
    const speciesOptions = ref([
      { id: 1, name: '大肠杆菌', scientific_name: 'Escherichia coli', description: '常见的肠道细菌', status: 'active' },
      { id: 2, name: '金黄色葡萄球菌', scientific_name: 'Staphylococcus aureus', description: '常见的致病菌', status: 'active' },
      { id: 3, name: '肺炎链球菌', scientific_name: 'Streptococcus pneumoniae', description: '引起肺炎的细菌', status: 'active' }
    ])

    // 地区管理相关
    const regionOptions = ref([
      { id: 1, name: '北京市', code: 'BJ', level: 'province', status: 'active' },
      { id: 2, name: '上海市', code: 'SH', level: 'province', status: 'active' },
      { id: 3, name: '广东省', code: 'GD', level: 'province', status: 'active' },
      { id: 4, name: '江苏省', code: 'JS', level: 'province', status: 'active' },
      { id: 5, name: '浙江省', code: 'ZJ', level: 'province', status: 'active' }
    ])

    // 样本来源管理相关
    const sourceOptions = ref([
      { id: 1, name: '血液', category: 'clinical', description: '临床血液样本', status: 'active' },
      { id: 2, name: '粪便', category: 'clinical', description: '临床粪便样本', status: 'active' },
      { id: 3, name: '尿液', category: 'clinical', description: '临床尿液样本', status: 'active' },
      { id: 4, name: '肉类', category: 'food', description: '食品肉类样本', status: 'active' },
      { id: 5, name: '饮用水', category: 'environmental', description: '环境水样', status: 'active' },
      { id: 6, name: '土壤', category: 'environmental', description: '环境土样', status: 'active' }
    ])

    // 实验管理相关
    const experimentTypes = ref([])

    // 对话框状态
    const speciesDialogVisible = ref(false)
    const regionDialogVisible = ref(false)
    const sourceDialogVisible = ref(false)
    const experimentDialogVisible = ref(false)

    // 表单数据
    const speciesForm = reactive({
      id: null,
      name: '',
      scientific_name: '',
      abbreviation: '',
      ncbi_txid: '',
      description: '',
      status: 'active'
    })

    const regionForm = reactive({
      id: null,
      name: '',
      code: '',
      level: 'province',
      status: 'active'
    })

    const sourceForm = reactive({
      id: null,
      name: '',
      category: 'clinical',
      description: '',
      status: 'active'
    })

    const experimentForm = reactive({
      id: null,
      name: '',
      description: '',
      protocol: '',
      status: 'active'
    })

    // 菌种管理方法
    const addSpecies = () => {
      Object.assign(speciesForm, {
        id: null,
        name: '',
        scientific_name: '',
        abbreviation: '',
        ncbi_txid: '',
        description: '',
        status: 'active'
      })
      speciesDialogVisible.value = true
    }

    const editSpecies = (species) => {
      Object.assign(speciesForm, species)
      speciesDialogVisible.value = true
    }

    const saveSpecies = () => {
      if (speciesForm.id) {
        // 更新菌种
        const index = speciesOptions.value.findIndex(s => s.id === speciesForm.id)
        if (index !== -1) {
          speciesOptions.value[index] = { ...speciesForm }
        }
        ElMessage.success('菌种更新成功')
      } else {
        // 添加菌种
        const newSpecies = {
          id: Date.now(),
          ...speciesForm
        }
        speciesOptions.value.push(newSpecies)
        ElMessage.success('菌种添加成功')
      }
      speciesDialogVisible.value = false
    }

    const deleteSpecies = (species) => {
      ElMessageBox.confirm('确定要删除该菌种吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = speciesOptions.value.findIndex(s => s.id === species.id)
        if (index !== -1) {
          speciesOptions.value.splice(index, 1)
        }
        ElMessage.success('菌种删除成功')
      }).catch(() => {})
    }

    const toggleSpeciesStatus = (species) => {
      species.status = species.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`菌种已${species.status === 'active' ? '启用' : '禁用'}`)
    }

    // 地区管理方法
    const addRegion = () => {
      Object.assign(regionForm, { id: null, name: '', code: '', level: 'province', status: 'active' })
      regionDialogVisible.value = true
    }

    const editRegion = (region) => {
      Object.assign(regionForm, region)
      regionDialogVisible.value = true
    }

    const saveRegion = () => {
      if (regionForm.id) {
        // 更新地区
        const index = regionOptions.value.findIndex(r => r.id === regionForm.id)
        if (index !== -1) {
          regionOptions.value[index] = { ...regionForm }
        }
        ElMessage.success('地区更新成功')
      } else {
        // 添加地区
        const newRegion = {
          id: Date.now(),
          ...regionForm
        }
        regionOptions.value.push(newRegion)
        ElMessage.success('地区添加成功')
      }
      regionDialogVisible.value = false
    }

    const deleteRegion = (region) => {
      ElMessageBox.confirm('确定要删除该地区吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = regionOptions.value.findIndex(r => r.id === region.id)
        if (index !== -1) {
          regionOptions.value.splice(index, 1)
        }
        ElMessage.success('地区删除成功')
      }).catch(() => {})
    }

    const toggleRegionStatus = (region) => {
      region.status = region.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`地区已${region.status === 'active' ? '启用' : '禁用'}`)
    }

    // 样本来源管理方法
    const addSource = () => {
      Object.assign(sourceForm, { id: null, name: '', category: 'clinical', description: '', status: 'active' })
      sourceDialogVisible.value = true
    }

    const editSource = (source) => {
      Object.assign(sourceForm, source)
      sourceDialogVisible.value = true
    }

    const saveSource = () => {
      if (sourceForm.id) {
        // 更新样本来源
        const index = sourceOptions.value.findIndex(s => s.id === sourceForm.id)
        if (index !== -1) {
          sourceOptions.value[index] = { ...sourceForm }
        }
        ElMessage.success('样本来源更新成功')
      } else {
        // 添加样本来源
        const newSource = {
          id: Date.now(),
          ...sourceForm
        }
        sourceOptions.value.push(newSource)
        ElMessage.success('样本来源添加成功')
      }
      sourceDialogVisible.value = false
    }

    const deleteSource = (source) => {
      ElMessageBox.confirm('确定要删除该样本来源吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = sourceOptions.value.findIndex(s => s.id === source.id)
        if (index !== -1) {
          sourceOptions.value.splice(index, 1)
        }
        ElMessage.success('样本来源删除成功')
      }).catch(() => {})
    }

    const toggleSourceStatus = (source) => {
      source.status = source.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`样本来源已${source.status === 'active' ? '启用' : '禁用'}`)
    }

    // 实验类型管理方法
    const addExperiment = () => {
      Object.assign(experimentForm, { id: null, name: '', description: '', protocol: '', status: 'active' })
      experimentDialogVisible.value = true
    }

    const editExperiment = (experiment) => {
      Object.assign(experimentForm, experiment)
      experimentDialogVisible.value = true
    }

    const saveExperiment = () => {
      if (experimentForm.id) {
        // 更新实验类型
        const index = experimentTypes.value.findIndex(e => e.id === experimentForm.id)
        if (index !== -1) {
          experimentTypes.value[index] = { ...experimentForm }
        }
        ElMessage.success('实验类型更新成功')
      } else {
        // 添加实验类型
        const newExperiment = {
          id: Date.now(),
          ...experimentForm
        }
        experimentTypes.value.push(newExperiment)
        ElMessage.success('实验类型添加成功')
      }
      experimentDialogVisible.value = false
    }

    const deleteExperiment = (experiment) => {
      ElMessageBox.confirm('确定要删除该实验类型吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = experimentTypes.value.findIndex(e => e.id === experiment.id)
        if (index !== -1) {
          experimentTypes.value.splice(index, 1)
        }
        ElMessage.success('实验类型删除成功')
      }).catch(() => {})
    }

    const toggleExperimentStatus = (experiment) => {
      experiment.status = experiment.status === 'active' ? 'inactive' : 'active'
      ElMessage.success(`实验类型已${experiment.status === 'active' ? '启用' : '禁用'}`)
    }

    return {
      activeTab,
      speciesOptions,
      regionOptions,
      sourceOptions,
      experimentTypes,
      // 对话框状态
      speciesDialogVisible,
      regionDialogVisible,
      sourceDialogVisible,
      experimentDialogVisible,
      // 表单数据
      speciesForm,
      regionForm,
      sourceForm,
      experimentForm,
      // 菌种管理方法
      addSpecies,
      editSpecies,
      saveSpecies,
      deleteSpecies,
      toggleSpeciesStatus,
      // 地区管理方法
      addRegion,
      editRegion,
      saveRegion,
      deleteRegion,
      toggleRegionStatus,
      // 样本来源管理方法
      addSource,
      editSource,
      saveSource,
      deleteSource,
      toggleSourceStatus,
      // 实验类型管理方法
      addExperiment,
      editExperiment,
      saveExperiment,
      deleteExperiment,
      toggleExperimentStatus
    }
  }
}
</script>

<style scoped>
.experiment-settings-container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #606266;
  font-size: 14px;
}

.content-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.settings-section {
  padding: 24px;
}

.experiment-tabs {
  margin-top: 0;
}

.experiment-tabs .el-tabs__content {
  padding: 20px 0;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.toolbar .el-button {
  margin-right: 12px;
}

.toolbar .el-button:last-child {
  margin-right: 0;
}

.species-management,
.region-management,
.source-management,
.experiment-management {
  background: #fafafa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.el-table {
  border-radius: 6px;
  overflow: hidden;
}

.el-table th {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 600;
}

.el-table td {
  padding: 12px 0;
}

.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 对话框样式 */
.el-dialog__header {
  background-color: #f5f7fa;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
}

.el-dialog__title {
  font-weight: 600;
  color: #303133;
}

.el-dialog__body {
  padding: 24px;
}

.el-form-item {
  margin-bottom: 20px;
}

.el-form-item__label {
  font-weight: 500;
  color: #606266;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .experiment-settings-container {
    padding: 10px;
  }

  .page-header,
  .settings-section {
    padding: 16px;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar .el-button {
    margin-bottom: 8px;
    margin-right: 0;
  }

  .el-table {
    font-size: 12px;
  }
}
</style>
