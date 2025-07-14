<template>
  <div class="admin-settings-container">
    <div class="page-header">
      <h1>管理员设置</h1>
      <p>配置系统字段和选项</p>
    </div>

    <div class="content-area">
      <el-tabs v-model="activeTab" type="card">
        <!-- 菌种管理 -->
        <el-tab-pane label="菌种管理" name="species">
          <div class="field-management">
            <div class="field-header">
              <h3>菌种（属）配置</h3>
              <el-button type="primary" @click="addSpecies">
                <el-icon><Plus /></el-icon>
                添加菌种
              </el-button>
            </div>

            <el-table :data="speciesOptions" border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="菌种名称" />
              <el-table-column prop="scientific_name" label="学名" />
              <el-table-column prop="description" label="描述" />
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
          <div class="field-management">
            <div class="field-header">
              <h3>地区配置</h3>
              <el-button type="primary" @click="addRegion">
                <el-icon><Plus /></el-icon>
                添加地区
              </el-button>
            </div>

            <el-table :data="regionOptions" border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="地区名称" />
              <el-table-column prop="code" label="地区代码" />
              <el-table-column prop="level" label="级别" width="100">
                <template #default="scope">
                  <el-tag size="small">{{ getLevelText(scope.row.level) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="parent_name" label="上级地区" />
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
        <el-tab-pane label="样本来源" name="sources">
          <div class="field-management">
            <div class="field-header">
              <h3>样本来源配置</h3>
              <el-button type="primary" @click="addSource">
                <el-icon><Plus /></el-icon>
                添加来源
              </el-button>
            </div>

            <el-table :data="sourceOptions" border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="来源名称" />
              <el-table-column prop="category" label="类别" />
              <el-table-column prop="description" label="描述" />
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

        <!-- 系统配置 -->
        <el-tab-pane label="系统配置" name="system">
          <div class="system-config">
            <el-form :model="systemConfig" label-width="120px">
              <el-form-item label="系统名称">
                <el-input v-model="systemConfig.systemName" placeholder="请输入系统名称" />
              </el-form-item>
              <el-form-item label="系统描述">
                <el-input
                  v-model="systemConfig.systemDescription"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入系统描述"
                />
              </el-form-item>
              <el-form-item label="默认语言">
                <el-select v-model="systemConfig.defaultLanguage" placeholder="请选择默认语言">
                  <el-option label="中文" value="zh-CN" />
                  <el-option label="英文" value="en-US" />
                </el-select>
              </el-form-item>
              <el-form-item label="时区">
                <el-select v-model="systemConfig.timezone" placeholder="请选择时区">
                  <el-option label="Asia/Shanghai" value="Asia/Shanghai" />
                  <el-option label="UTC" value="UTC" />
                </el-select>
              </el-form-item>
              <el-form-item label="自动备份">
                <el-switch v-model="systemConfig.autoBackup" />
              </el-form-item>
              <el-form-item label="备份间隔">
                <el-select v-model="systemConfig.backupInterval" :disabled="!systemConfig.autoBackup">
                  <el-option label="每天" value="daily" />
                  <el-option label="每周" value="weekly" />
                  <el-option label="每月" value="monthly" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveSystemConfig">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 菌种编辑对话框 -->
    <el-dialog v-model="speciesDialogVisible" :title="isEditSpecies ? '编辑菌种' : '添加菌种'" width="500px">
      <el-form ref="speciesFormRef" :model="speciesForm" :rules="speciesFormRules" label-width="100px">
        <el-form-item label="菌种名称" prop="name">
          <el-input v-model="speciesForm.name" placeholder="请输入菌种名称" />
        </el-form-item>
        <el-form-item label="学名" prop="scientific_name">
          <el-input v-model="speciesForm.scientific_name" placeholder="请输入学名" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="speciesForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="speciesForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="speciesDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSpecies">确定</el-button>
      </template>
    </el-dialog>

    <!-- 地区编辑对话框 -->
    <el-dialog v-model="regionDialogVisible" :title="isEditRegion ? '编辑地区' : '添加地区'" width="500px">
      <el-form ref="regionFormRef" :model="regionForm" :rules="regionFormRules" label-width="100px">
        <el-form-item label="地区名称" prop="name">
          <el-input v-model="regionForm.name" placeholder="请输入地区名称" />
        </el-form-item>
        <el-form-item label="地区代码" prop="code">
          <el-input v-model="regionForm.code" placeholder="请输入地区代码" />
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="regionForm.level" placeholder="请选择级别">
            <el-option label="省/直辖市" value="province" />
            <el-option label="市/区" value="city" />
            <el-option label="县/区" value="county" />
          </el-select>
        </el-form-item>
        <el-form-item label="上级地区" prop="parent_id">
          <el-select v-model="regionForm.parent_id" placeholder="请选择上级地区" clearable>
            <el-option
              v-for="region in parentRegions"
              :key="region.id"
              :label="region.name"
              :value="region.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="regionForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="regionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRegion">确定</el-button>
      </template>
    </el-dialog>

    <!-- 样本来源编辑对话框 -->
    <el-dialog v-model="sourceDialogVisible" :title="isEditSource ? '编辑来源' : '添加来源'" width="500px">
      <el-form ref="sourceFormRef" :model="sourceForm" :rules="sourceFormRules" label-width="100px">
        <el-form-item label="来源名称" prop="name">
          <el-input v-model="sourceForm.name" placeholder="请输入来源名称" />
        </el-form-item>
        <el-form-item label="类别" prop="category">
          <el-select v-model="sourceForm.category" placeholder="请选择类别">
            <el-option label="临床样本" value="clinical" />
            <el-option label="环境样本" value="environmental" />
            <el-option label="食品样本" value="food" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="sourceForm.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="sourceForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sourceDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveSource">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'AdminSettings',
  setup () {
    const activeTab = ref('species')

    // 菌种相关
    const speciesOptions = ref([])
    const speciesDialogVisible = ref(false)
    const isEditSpecies = ref(false)
    const speciesFormRef = ref(null)
    const speciesForm = reactive({
      id: null,
      name: '',
      scientific_name: '',
      description: '',
      status: 'active'
    })
    const speciesFormRules = {
      name: [{ required: true, message: '请输入菌种名称', trigger: 'blur' }],
      scientific_name: [{ required: true, message: '请输入学名', trigger: 'blur' }]
    }

    // 地区相关
    const regionOptions = ref([])
    const regionDialogVisible = ref(false)
    const isEditRegion = ref(false)
    const regionFormRef = ref(null)
    const regionForm = reactive({
      id: null,
      name: '',
      code: '',
      level: 'province',
      parent_id: null,
      status: 'active'
    })
    const regionFormRules = {
      name: [{ required: true, message: '请输入地区名称', trigger: 'blur' }],
      code: [{ required: true, message: '请输入地区代码', trigger: 'blur' }],
      level: [{ required: true, message: '请选择级别', trigger: 'change' }]
    }

    // 样本来源相关
    const sourceOptions = ref([])
    const sourceDialogVisible = ref(false)
    const isEditSource = ref(false)
    const sourceFormRef = ref(null)
    const sourceForm = reactive({
      id: null,
      name: '',
      category: 'clinical',
      description: '',
      status: 'active'
    })
    const sourceFormRules = {
      name: [{ required: true, message: '请输入来源名称', trigger: 'blur' }],
      category: [{ required: true, message: '请选择类别', trigger: 'change' }]
    }

    // 系统配置
    const systemConfig = reactive({
      systemName: 'PAMS',
      systemDescription: '病原菌分析管理系统',
      defaultLanguage: 'zh-CN',
      timezone: 'Asia/Shanghai',
      autoBackup: true,
      backupInterval: 'daily'
    })

    // 计算属性
    const parentRegions = computed(() => {
      return regionOptions.value.filter(region =>
        region.level === 'province' && region.status === 'active'
      )
    })

    // 加载数据
    const loadSpeciesOptions = async () => {
      try {
        // TODO: 实现从后端加载菌种数据
        speciesOptions.value = [
          { id: 1, name: '大肠杆菌', scientific_name: 'Escherichia coli', description: '常见病原菌', status: 'active' },
          { id: 2, name: '沙门氏菌', scientific_name: 'Salmonella', description: '肠道病原菌', status: 'active' },
          { id: 3, name: '志贺氏菌', scientific_name: 'Shigella', description: '痢疾病原菌', status: 'active' }
        ]
      } catch (error) {
        ElMessage.error('加载菌种数据失败')
      }
    }

    const loadRegionOptions = async () => {
      try {
        // TODO: 实现从后端加载地区数据
        regionOptions.value = [
          { id: 1, name: '北京市', code: '110000', level: 'province', parent_id: null, parent_name: '', status: 'active' },
          { id: 2, name: '上海市', code: '310000', level: 'province', parent_id: null, parent_name: '', status: 'active' },
          { id: 3, name: '广东省', code: '440000', level: 'province', parent_id: null, parent_name: '', status: 'active' }
        ]
      } catch (error) {
        ElMessage.error('加载地区数据失败')
      }
    }

    const loadSourceOptions = async () => {
      try {
        // TODO: 实现从后端加载来源数据
        sourceOptions.value = [
          { id: 1, name: '血液', category: 'clinical', description: '临床血液样本', status: 'active' },
          { id: 2, name: '粪便', category: 'clinical', description: '临床粪便样本', status: 'active' },
          { id: 3, name: '食品', category: 'food', description: '食品样本', status: 'active' }
        ]
      } catch (error) {
        ElMessage.error('加载来源数据失败')
      }
    }

    const loadSystemConfig = async () => {
      try {
        // TODO: 实现从后端加载系统配置
        // systemConfig = await api.getSystemConfig()
      } catch (error) {
        ElMessage.error('加载系统配置失败')
      }
    }

    // 菌种管理方法
    const addSpecies = () => {
      isEditSpecies.value = false
      speciesForm.id = null
      speciesForm.name = ''
      speciesForm.scientific_name = ''
      speciesForm.description = ''
      speciesForm.status = 'active'
      speciesDialogVisible.value = true
    }

    const editSpecies = (species) => {
      isEditSpecies.value = true
      speciesForm.id = species.id
      speciesForm.name = species.name
      speciesForm.scientific_name = species.scientific_name
      speciesForm.description = species.description
      speciesForm.status = species.status
      speciesDialogVisible.value = true
    }

    const saveSpecies = async () => {
      if (!speciesFormRef.value) return

      await speciesFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          // TODO: 实现保存菌种数据
          ElMessage.success('菌种保存成功')
          speciesDialogVisible.value = false
          loadSpeciesOptions()
        } catch (error) {
          ElMessage.error('保存失败')
        }
      })
    }

    const toggleSpeciesStatus = async (species) => {
      try {
        species.status = species.status === 'active' ? 'disabled' : 'active'
        // TODO: 实现状态更新
        ElMessage.success('状态更新成功')
      } catch (error) {
        ElMessage.error('状态更新失败')
      }
    }

    const deleteSpecies = async (species) => {
      try {
        await ElMessageBox.confirm('确定要删除该菌种吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 实现删除菌种
        ElMessage.success('删除成功')
        loadSpeciesOptions()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 地区管理方法
    const addRegion = () => {
      isEditRegion.value = false
      regionForm.id = null
      regionForm.name = ''
      regionForm.code = ''
      regionForm.level = 'province'
      regionForm.parent_id = null
      regionForm.status = 'active'
      regionDialogVisible.value = true
    }

    const editRegion = (region) => {
      isEditRegion.value = true
      regionForm.id = region.id
      regionForm.name = region.name
      regionForm.code = region.code
      regionForm.level = region.level
      regionForm.parent_id = region.parent_id
      regionForm.status = region.status
      regionDialogVisible.value = true
    }

    const saveRegion = async () => {
      if (!regionFormRef.value) return

      await regionFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          // TODO: 实现保存地区数据
          ElMessage.success('地区保存成功')
          regionDialogVisible.value = false
          loadRegionOptions()
        } catch (error) {
          ElMessage.error('保存失败')
        }
      })
    }

    const toggleRegionStatus = async (region) => {
      try {
        region.status = region.status === 'active' ? 'disabled' : 'active'
        // TODO: 实现状态更新
        ElMessage.success('状态更新成功')
      } catch (error) {
        ElMessage.error('状态更新失败')
      }
    }

    const deleteRegion = async (region) => {
      try {
        await ElMessageBox.confirm('确定要删除该地区吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 实现删除地区
        ElMessage.success('删除成功')
        loadRegionOptions()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 样本来源管理方法
    const addSource = () => {
      isEditSource.value = false
      sourceForm.id = null
      sourceForm.name = ''
      sourceForm.category = 'clinical'
      sourceForm.description = ''
      sourceForm.status = 'active'
      sourceDialogVisible.value = true
    }

    const editSource = (source) => {
      isEditSource.value = true
      sourceForm.id = source.id
      sourceForm.name = source.name
      sourceForm.category = source.category
      sourceForm.description = source.description
      sourceForm.status = source.status
      sourceDialogVisible.value = true
    }

    const saveSource = async () => {
      if (!sourceFormRef.value) return

      await sourceFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          // TODO: 实现保存来源数据
          ElMessage.success('来源保存成功')
          sourceDialogVisible.value = false
          loadSourceOptions()
        } catch (error) {
          ElMessage.error('保存失败')
        }
      })
    }

    const toggleSourceStatus = async (source) => {
      try {
        source.status = source.status === 'active' ? 'disabled' : 'active'
        // TODO: 实现状态更新
        ElMessage.success('状态更新成功')
      } catch (error) {
        ElMessage.error('状态更新失败')
      }
    }

    const deleteSource = async (source) => {
      try {
        await ElMessageBox.confirm('确定要删除该来源吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 实现删除来源
        ElMessage.success('删除成功')
        loadSourceOptions()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    // 系统配置方法
    const saveSystemConfig = async () => {
      try {
        // TODO: 实现保存系统配置
        ElMessage.success('系统配置保存成功')
      } catch (error) {
        ElMessage.error('保存失败')
      }
    }

    // 工具方法
    const getLevelText = (level) => {
      const textMap = {
        province: '省/直辖市',
        city: '市/区',
        county: '县/区'
      }
      return textMap[level] || '未知'
    }

    onMounted(() => {
      loadSpeciesOptions()
      loadRegionOptions()
      loadSourceOptions()
      loadSystemConfig()
    })

    return {
      activeTab,
      speciesOptions,
      speciesDialogVisible,
      isEditSpecies,
      speciesForm,
      speciesFormRules,
      speciesFormRef,
      regionOptions,
      regionDialogVisible,
      isEditRegion,
      regionForm,
      regionFormRules,
      regionFormRef,
      sourceOptions,
      sourceDialogVisible,
      isEditSource,
      sourceForm,
      sourceFormRules,
      sourceFormRef,
      systemConfig,
      parentRegions,
      addSpecies,
      editSpecies,
      saveSpecies,
      toggleSpeciesStatus,
      deleteSpecies,
      addRegion,
      editRegion,
      saveRegion,
      toggleRegionStatus,
      deleteRegion,
      addSource,
      editSource,
      saveSource,
      toggleSourceStatus,
      deleteSource,
      saveSystemConfig,
      getLevelText
    }
  }
}
</script>

<style scoped>
.admin-settings-container {
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

.field-management {
  margin-top: 20px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.field-header h3 {
  margin: 0;
  color: #303133;
}

.system-config {
  margin-top: 20px;
}
</style>
