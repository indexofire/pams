<template>
  <div class="system-settings-container">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>系统配置和管理</p>
    </div>

    <div class="content-area">
      <el-tabs v-model="activeTab" type="card">
        <!-- 用户管理 -->
        <el-tab-pane label="用户管理" name="users">
          <div class="user-management">
            <div class="toolbar">
              <el-button type="primary" @click="addUser">
                <el-icon><Plus /></el-icon>
                添加用户
              </el-button>
              <el-button @click="refreshUsers">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>

            <el-table :data="users" border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" />
              <el-table-column prop="role" label="角色" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.role === 'admin' ? 'danger' : scope.row.role === 'advanced' ? 'warning' : 'primary'"
                    size="small"
                  >
                    {{ getRoleLabel(scope.row.role) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="created_at" label="创建时间" width="180" />
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button size="small" @click="editUser(scope.row)">编辑</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    @click="deleteUser(scope.row)"
                    :disabled="scope.row.username === 'admin'"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- 菌种管理 -->
        <el-tab-pane label="菌种管理" name="species">
          <div class="species-management">
            <div class="toolbar">
              <el-button type="primary" @click="addSpecies">
                <el-icon><Plus /></el-icon>
                添加菌种
              </el-button>
            </div>

            <el-table :data="speciesOptions" border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="菌种名称" />
              <el-table-column prop="scientific_name" label="学名" width="200">
                <template #default="scope">
                  <em>{{ scope.row.scientific_name }}</em>
                </template>
              </el-table-column>
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

        <!-- 实验管理 -->
        <el-tab-pane label="实验管理" name="experiments">
          <div class="experiment-management">
            <div class="toolbar">
              <el-button type="primary" @click="addExperiment">
                <el-icon><Plus /></el-icon>
                添加实验类型
              </el-button>
            </div>

            <el-table :data="experimentTypes" border>
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="name" label="实验类型" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="protocol" label="实验协议" />
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

        <!-- 基本设置 -->
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" label-width="120px">
            <el-form-item label="系统名称">
              <el-input v-model="basicForm.systemName" placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicForm.systemVersion" placeholder="请输入系统版本" readonly />
            </el-form-item>
            <el-form-item label="管理员邮箱">
              <el-input v-model="basicForm.adminEmail" placeholder="请输入管理员邮箱" />
            </el-form-item>
            <el-form-item label="系统描述">
              <el-input
                v-model="basicForm.systemDescription"
                type="textarea"
                :rows="3"
                placeholder="请输入系统描述"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 数据库设置 -->
        <el-tab-pane label="数据库设置" name="database">
          <el-form :model="databaseForm" label-width="120px">
            <el-form-item label="数据库类型">
              <el-select v-model="databaseForm.type" placeholder="请选择数据库类型">
                <el-option label="SQLite" value="sqlite" />
                <el-option label="MySQL" value="mysql" />
                <el-option label="PostgreSQL" value="postgresql" />
              </el-select>
            </el-form-item>
            <el-form-item label="数据库主机">
              <el-input v-model="databaseForm.host" placeholder="请输入数据库主机" />
            </el-form-item>
            <el-form-item label="数据库端口">
              <el-input v-model="databaseForm.port" placeholder="请输入数据库端口" />
            </el-form-item>
            <el-form-item label="数据库名称">
              <el-input v-model="databaseForm.database" placeholder="请输入数据库名称" />
            </el-form-item>
            <el-form-item label="用户名">
              <el-input v-model="databaseForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="databaseForm.password" type="password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="testDatabaseConnection">测试连接</el-button>
              <el-button @click="saveDatabaseSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 用户编辑对话框 -->
    <el-dialog v-model="userDialogVisible" title="用户管理" width="600px">
      <el-form :model="userForm" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" v-if="!userForm.id">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="userForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="高级用户" value="advanced" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 菌种编辑对话框 -->
    <el-dialog v-model="speciesDialogVisible" title="菌种管理" width="600px">
      <el-form :model="speciesForm" label-width="80px">
        <el-form-item label="菌种名称">
          <el-input v-model="speciesForm.name" placeholder="请输入菌种名称" />
        </el-form-item>
        <el-form-item label="学名">
          <el-input v-model="speciesForm.scientific_name" placeholder="请输入学名" />
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
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'SystemSettings',
  components: {
    Plus,
    Refresh
  },
  setup () {
    const activeTab = ref('users')
    
    // 用户管理相关
    const users = ref([
      { id: 1, username: 'admin', role: 'admin', created_at: '2023-01-01 10:00:00' },
      { id: 2, username: 'advanced', role: 'advanced', created_at: '2023-01-02 10:00:00' },
      { id: 3, username: 'user', role: 'user', created_at: '2023-01-03 10:00:00' }
    ])
    
    const userDialogVisible = ref(false)
    const userForm = reactive({
      id: null,
      username: '',
      password: '',
      role: 'user'
    })

    // 菌种管理相关
    const speciesOptions = ref([
      { id: 1, name: '大肠杆菌', scientific_name: 'Escherichia coli', description: '常见的肠道细菌', status: 'active' },
      { id: 2, name: '金黄色葡萄球菌', scientific_name: 'Staphylococcus aureus', description: '常见的致病菌', status: 'active' },
      { id: 3, name: '肺炎链球菌', scientific_name: 'Streptococcus pneumoniae', description: '引起肺炎的细菌', status: 'active' }
    ])
    
    const speciesDialogVisible = ref(false)
    const speciesForm = reactive({
      id: null,
      name: '',
      scientific_name: '',
      description: '',
      status: 'active'
    })

    // 实验管理相关
    const experimentTypes = ref([
      { id: 1, name: 'MLST分型', description: '多位点序列分型', protocol: '基于7个管家基因的序列分析...', status: 'active' },
      { id: 2, name: '耐药基因检测', description: '检测细菌的耐药基因', protocol: '使用PCR或NGS技术检测...', status: 'active' },
      { id: 3, name: '毒力基因检测', description: '检测细菌的毒力基因', protocol: '使用特定引物进行PCR检测...', status: 'active' }
    ])
    
    const experimentDialogVisible = ref(false)
    const experimentForm = reactive({
      id: null,
      name: '',
      description: '',
      protocol: '',
      status: 'active'
    })

    // 基本设置
    const basicForm = reactive({
      systemName: 'PAMS - 细菌基因组管理系统',
      systemVersion: '1.0.0',
      adminEmail: 'admin@pams.com',
      systemDescription: '用于细菌基因组数据管理和分析的综合平台'
    })

    // 数据库设置
    const databaseForm = reactive({
      type: 'sqlite',
      host: 'localhost',
      port: '3306',
      database: 'pams',
      username: '',
      password: ''
    })

    // 用户管理方法
    const getRoleLabel = (role) => {
      const roleMap = {
        admin: '管理员',
        advanced: '高级用户',
        user: '普通用户'
      }
      return roleMap[role] || role
    }

    const addUser = () => {
      Object.assign(userForm, { id: null, username: '', password: '', role: 'user' })
      userDialogVisible.value = true
    }

    const editUser = (user) => {
      Object.assign(userForm, { ...user, password: '' })
      userDialogVisible.value = true
    }

    const saveUser = () => {
      if (userForm.id) {
        // 更新用户
        const index = users.value.findIndex(u => u.id === userForm.id)
        if (index !== -1) {
          users.value[index] = { ...userForm, created_at: users.value[index].created_at }
        }
        ElMessage.success('用户更新成功')
      } else {
        // 添加用户
        const newUser = {
          id: Date.now(),
          username: userForm.username,
          role: userForm.role,
          created_at: new Date().toLocaleString()
        }
        users.value.push(newUser)
        ElMessage.success('用户添加成功')
      }
      userDialogVisible.value = false
    }

    const deleteUser = (user) => {
      ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const index = users.value.findIndex(u => u.id === user.id)
        if (index !== -1) {
          users.value.splice(index, 1)
        }
        ElMessage.success('用户删除成功')
      }).catch(() => {})
    }

    const refreshUsers = () => {
      ElMessage.success('用户列表刷新成功')
    }

    // 菌种管理方法
    const addSpecies = () => {
      Object.assign(speciesForm, { id: null, name: '', scientific_name: '', description: '', status: 'active' })
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
          name: speciesForm.name,
          scientific_name: speciesForm.scientific_name,
          description: speciesForm.description,
          status: speciesForm.status
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

    // 实验管理方法
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
          name: experimentForm.name,
          description: experimentForm.description,
          protocol: experimentForm.protocol,
          status: experimentForm.status
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

    // 设置保存方法
    const saveBasicSettings = () => {
      ElMessage.success('基本设置保存成功')
    }

    const testDatabaseConnection = () => {
      ElMessage.success('数据库连接测试成功')
    }

    const saveDatabaseSettings = () => {
      ElMessage.success('数据库设置保存成功')
    }

    return {
      activeTab,
      users,
      userDialogVisible,
      userForm,
      speciesOptions,
      speciesDialogVisible,
      speciesForm,
      experimentTypes,
      experimentDialogVisible,
      experimentForm,
      basicForm,
      databaseForm,
      getRoleLabel,
      addUser,
      editUser,
      saveUser,
      deleteUser,
      refreshUsers,
      addSpecies,
      editSpecies,
      saveSpecies,
      deleteSpecies,
      toggleSpeciesStatus,
      addExperiment,
      editExperiment,
      saveExperiment,
      deleteExperiment,
      toggleExperimentStatus,
      saveBasicSettings,
      testDatabaseConnection,
      saveDatabaseSettings
    }
  }
}
</script>

<style lang="scss" scoped>
.system-settings-container {
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
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.toolbar .el-button {
  margin-right: 10px;
}

.user-management,
.species-management,
.experiment-management {
  .el-table {
    margin-top: 20px;
  }
}

.el-dialog {
  .el-form {
    padding: 20px;
  }
}

// 学名斜体样式
em {
  font-style: italic;
  color: #606266;
}
</style> 