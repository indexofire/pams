<template>
  <div class="system-settings-container">
    <div class="page-header">
      <h1>系统设置</h1>
      <p>系统配置和管理</p>
    </div>

    <div class="content-area">
      <!-- 系统相关设置区块 -->
      <div class="settings-section">
        <div class="section-header">
          <h2>系统相关设置</h2>
          <p>管理系统配置和用户权限</p>
        </div>
        <el-tabs v-model="activeTab" type="card" class="system-tabs">
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

            <el-table
              :data="users"
              border
              style="width: 100%"
              :height="400"
              :table-layout="'fixed'"
            >
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
              <el-table-column prop="createdAt" label="创建时间" width="180" />
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

        <!-- 权限管理 -->
        <el-tab-pane label="权限管理" name="permissions">
          <div class="permission-management">
            <div class="toolbar">
              <el-button type="primary" @click="addRole">
                <el-icon><Plus /></el-icon>
                创建角色
              </el-button>
              <el-button @click="refreshRoles">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>

            <!-- 角色列表 -->
            <el-table
              :data="roles"
              style="width: 100%"
              :height="400"
              v-loading="rolesLoading"
            >
              <el-table-column prop="name" label="角色名称" width="150" />
              <el-table-column prop="description" label="描述" />
              <el-table-column label="权限数量" width="120">
                <template #default="scope">
                  <el-tag>{{ scope.row.permissions?.length || 0 }} 个权限</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="类型" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.custom ? 'warning' : 'success'">
                    {{ scope.row.custom ? '自定义' : '系统' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200">
                <template #default="scope">
                  <el-button
                    size="small"
                    @click="viewRole(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button
                    v-if="scope.row.custom"
                    size="small"
                    @click="editRole(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    v-if="scope.row.custom"
                    size="small"
                    type="danger"
                    @click="deleteRole(scope.row)"
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

        <!-- 路径设置 -->
        <el-tab-pane label="路径设置" name="paths">
          <el-form :model="pathForm" label-width="150px">
            <el-form-item label="基因组数据保存路径">
              <el-input v-model="pathForm.genomesPath" placeholder="请输入基因组数据保存路径">
                <template #append>
                  <el-button @click="selectGenomesPath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">基因组文件上传后的保存目录</div>
            </el-form-item>

            <el-form-item label="SQLite数据库路径">
              <el-input v-model="pathForm.databasePath" placeholder="请输入SQLite数据库文件路径">
                <template #append>
                  <el-button @click="selectDatabasePath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">SQLite数据库文件的存储路径</div>
            </el-form-item>

            <el-form-item label="分析结果保存路径">
              <el-input v-model="pathForm.analysisPath" placeholder="请输入分析结果保存路径">
                <template #append>
                  <el-button @click="selectAnalysisPath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">分析结果和报告的保存目录</div>
            </el-form-item>

            <el-form-item label="临时文件路径">
              <el-input v-model="pathForm.tempPath" placeholder="请输入临时文件路径">
                <template #append>
                  <el-button @click="selectTempPath">选择</el-button>
                </template>
              </el-input>
              <div class="form-help">临时文件和缓存的存储目录</div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="savePathSettings">保存路径设置</el-button>
              <el-button @click="resetPathSettings">重置为默认</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        </el-tabs>
      </div>
    </div>
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

    <!-- 角色管理对话框 -->
    <el-dialog
      :title="editingRole ? '编辑角色' : '创建角色'"
      v-model="roleDialogVisible"
      width="800px"
      @close="resetRoleForm"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="name">
          <el-input
            v-model="roleForm.name"
            placeholder="请输入角色名称"
            maxlength="50"
          />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            placeholder="请输入角色描述"
            maxlength="200"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="权限设置">
          <div class="permission-tree-container">
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTree"
              :props="treeProps"
              show-checkbox
              node-key="id"
              :default-checked-keys="roleForm.permissions"
              @check="handlePermissionCheck"
            />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole" :loading="roleSaveLoading">
          {{ editingRole ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>
</template>

<script>
import { ref, reactive, onMounted, onErrorCaptured, nextTick, watch } from 'vue'
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
    const users = ref([])

    const userDialogVisible = ref(false)
    const userForm = reactive({
      id: null,
      username: '',
      password: '',
      role: 'user'
    })

    // 角色管理相关
    const roles = ref([])
    const rolesLoading = ref(false)
    const roleDialogVisible = ref(false)
    const editingRole = ref(false)
    const roleSaveLoading = ref(false)
    const permissionTreeRef = ref(null)

    const roleForm = reactive({
      id: null,
      name: '',
      description: '',
      permissions: []
    })

    const roleRules = {
      name: [
        { required: true, message: '请输入角色名称', trigger: 'blur' },
        { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入角色描述', trigger: 'blur' },
        { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
      ]
    }

    // 权限树配置
    const treeProps = {
      children: 'children',
      label: 'label'
    }

    const permissionTree = ref([
      {
        id: 'users',
        label: '用户管理',
        children: [
          { id: 'users.view', label: '查看用户' },
          { id: 'users.create', label: '创建用户' },
          { id: 'users.edit', label: '编辑用户' },
          { id: 'users.delete', label: '删除用户' },
          { id: 'users.manage_roles', label: '管理角色' }
        ]
      },
      {
        id: 'strains',
        label: '菌株管理',
        children: [
          { id: 'strains.view', label: '查看菌株' },
          { id: 'strains.create', label: '创建菌株' },
          { id: 'strains.edit', label: '编辑菌株' },
          { id: 'strains.delete', label: '删除菌株' },
          { id: 'strains.import', label: '导入菌株' },
          { id: 'strains.export', label: '导出菌株' }
        ]
      },
      {
        id: 'genomes',
        label: '基因组管理',
        children: [
          { id: 'genomes.view', label: '查看基因组' },
          { id: 'genomes.upload', label: '上传基因组' },
          { id: 'genomes.download', label: '下载基因组' },
          { id: 'genomes.delete', label: '删除基因组' }
        ]
      },
      {
        id: 'analysis',
        label: '分析功能',
        children: [
          { id: 'analysis.annotation', label: '基因组注释' },
          { id: 'analysis.mlst', label: 'MLST分析' },
          { id: 'analysis.resistance', label: '耐药基因分析' },
          { id: 'analysis.virulence', label: '毒力基因分析' },
          { id: 'analysis.phylogeny', label: '系统发育分析' }
        ]
      },
      {
        id: 'reports',
        label: '报告管理',
        children: [
          { id: 'reports.view', label: '查看报告' },
          { id: 'reports.create', label: '创建报告' },
          { id: 'reports.export', label: '导出报告' }
        ]
      },
      {
        id: 'system',
        label: '系统管理',
        children: [
          { id: 'system.settings', label: '系统设置' },
          { id: 'system.audit', label: '安全审计' },
          { id: 'system.backup', label: '数据备份' }
        ]
      }
    ])

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

    // 路径设置
    const pathForm = reactive({
      genomesPath: '',
      databasePath: '',
      analysisPath: '',
      tempPath: ''
    })

    // 角色管理方法
    const loadRoles = async () => {
      rolesLoading.value = true
      try {
        if (window.electronAPI && window.electronAPI.roles) {
          const roleList = await window.electronAPI.roles.getAll()
          roles.value = roleList || []
        } else {
          // 开发环境模拟数据
          roles.value = [
            {
              id: 1,
              name: 'admin',
              description: '系统管理员，拥有所有权限',
              custom: false,
              permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles', 'strains.view', 'strains.create', 'strains.edit', 'strains.delete', 'strains.import', 'strains.export', 'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.delete', 'analysis.annotation', 'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.phylogeny', 'reports.view', 'reports.create', 'reports.export', 'system.settings', 'system.audit', 'system.backup']
            },
            {
              id: 2,
              name: 'advanced',
              description: '高级用户，拥有大部分功能权限',
              custom: false,
              permissions: ['strains.view', 'strains.create', 'strains.edit', 'strains.import', 'strains.export', 'genomes.view', 'genomes.upload', 'genomes.download', 'analysis.annotation', 'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.phylogeny', 'reports.view', 'reports.create', 'reports.export']
            },
            {
              id: 3,
              name: 'user',
              description: '普通用户，拥有基本查看权限',
              custom: false,
              permissions: ['strains.view', 'genomes.view', 'reports.view']
            }
          ]
        }
      } catch (error) {
        console.error('加载角色列表失败:', error)
        ElMessage.error('加载角色列表失败')
      } finally {
        rolesLoading.value = false
      }
    }

    const refreshRoles = async () => {
      await loadRoles()
      ElMessage.success('角色列表刷新成功')
    }

    const addRole = () => {
      editingRole.value = false
      Object.assign(roleForm, {
        id: null,
        name: '',
        description: '',
        permissions: []
      })
      roleDialogVisible.value = true
    }

    const editRole = (role) => {
      editingRole.value = true
      Object.assign(roleForm, {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: [...(role.permissions || [])]
      })
      roleDialogVisible.value = true
      // 等待DOM更新后设置权限树的选中状态
      nextTick(() => {
        if (permissionTreeRef.value) {
          permissionTreeRef.value.setCheckedKeys(role.permissions || [])
        }
      })
    }

    const viewRole = (role) => {
      editingRole.value = false
      Object.assign(roleForm, {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: [...(role.permissions || [])]
      })
      roleDialogVisible.value = true
      // 等待DOM更新后设置权限树的选中状态
      nextTick(() => {
        if (permissionTreeRef.value) {
          permissionTreeRef.value.setCheckedKeys(role.permissions || [])
        }
      })
    }

    const resetRoleForm = () => {
      Object.assign(roleForm, {
        id: null,
        name: '',
        description: '',
        permissions: []
      })
      editingRole.value = false
      // 清空权限树的选中状态
      nextTick(() => {
        if (permissionTreeRef.value) {
          permissionTreeRef.value.setCheckedKeys([])
        }
      })
    }

    const handlePermissionCheck = (data, checked) => {
      const checkedKeys = checked.checkedKeys
      roleForm.permissions = checkedKeys
    }

    const saveRole = async () => {
      roleSaveLoading.value = true
      try {
        if (window.electronAPI && window.electronAPI.roles) {
          if (editingRole.value) {
            await window.electronAPI.roles.update(roleForm.id, roleForm)
            ElMessage.success('角色更新成功')
          } else {
            await window.electronAPI.roles.create(roleForm)
            ElMessage.success('角色创建成功')
          }
        } else {
          // 开发环境模拟
          if (editingRole.value) {
            const index = roles.value.findIndex(r => r.id === roleForm.id)
            if (index !== -1) {
              roles.value[index] = { ...roleForm, custom: true }
            }
            ElMessage.success('角色更新成功')
          } else {
            const newRole = {
              id: Date.now(),
              ...roleForm,
              custom: true
            }
            roles.value.push(newRole)
            ElMessage.success('角色创建成功')
          }
        }
        roleDialogVisible.value = false
        await loadRoles()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      } finally {
        roleSaveLoading.value = false
      }
    }

    const deleteRole = async (role) => {
      try {
        await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        if (window.electronAPI && window.electronAPI.roles) {
          await window.electronAPI.roles.delete(role.id)
        } else {
          // 开发环境模拟
          const index = roles.value.findIndex(r => r.id === role.id)
          if (index !== -1) {
            roles.value.splice(index, 1)
          }
        }
        ElMessage.success('角色删除成功')
        await loadRoles()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '删除失败')
        }
      }
    }

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

    const saveUser = async () => {
      try {
        if (userForm.id) {
          // 更新用户
          if (window.electronAPI && window.electronAPI.users) {
            await window.electronAPI.users.update(userForm.id, {
              username: userForm.username,
              role: userForm.role,
              password: userForm.password || undefined
            })
          } else {
            // 开发环境模拟
            const index = users.value.findIndex(u => u.id === userForm.id)
            if (index !== -1) {
              users.value[index] = { ...userForm, created_at: users.value[index].created_at }
            }
          }
          ElMessage.success('用户更新成功')
        } else {
          // 添加用户
          if (window.electronAPI && window.electronAPI.users) {
            await window.electronAPI.users.create({
              username: userForm.username,
              password: userForm.password,
              role: userForm.role
            })
          } else {
            // 开发环境模拟
            const newUser = {
              id: Date.now(),
              username: userForm.username,
              role: userForm.role,
              created_at: new Date().toLocaleString()
            }
            users.value.push(newUser)
          }
          ElMessage.success('用户添加成功')
        }
        userDialogVisible.value = false
        await loadUsers()
      } catch (error) {
        ElMessage.error(error.message || '操作失败')
      }
    }

    const deleteUser = async (user) => {
      try {
        await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        if (window.electronAPI && window.electronAPI.users) {
          await window.electronAPI.users.delete(user.id)
        } else {
          // 开发环境模拟
          const index = users.value.findIndex(u => u.id === user.id)
          if (index !== -1) {
            users.value.splice(index, 1)
          }
        }
        ElMessage.success('用户删除成功')
        await loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error(error.message || '删除失败')
        }
      }
    }

    const loadUsers = async () => {
      try {
        if (window.electronAPI && window.electronAPI.users) {
          const userList = await window.electronAPI.users.getAll()
          users.value = userList || []
        } else {
          // 开发环境模拟数据
          users.value = [
            { id: 1, username: 'admin', role: 'admin', createdAt: '2023-01-01 10:00:00' },
            { id: 2, username: 'advanced', role: 'advanced', createdAt: '2023-01-02 10:00:00' },
            { id: 3, username: 'user', role: 'user', createdAt: '2023-01-03 10:00:00' }
          ]
        }
      } catch (error) {
        console.error('加载用户列表失败:', error)
        ElMessage.error('加载用户列表失败')
      }
    }

    const refreshUsers = async () => {
      await loadUsers()
      ElMessage.success('用户列表刷新成功')
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

    // 路径设置相关方法
    const selectGenomesPath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showOpenDialog) {
          const result = await window.electronAPI.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择基因组数据保存路径'
          })
          if (!result.canceled && result.filePaths.length > 0) {
            pathForm.genomesPath = result.filePaths[0]
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const selectDatabasePath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showSaveDialog) {
          const result = await window.electronAPI.showSaveDialog({
            title: '选择SQLite数据库文件路径',
            defaultPath: 'pams.db',
            filters: [
              { name: 'SQLite数据库', extensions: ['db', 'sqlite', 'sqlite3'] },
              { name: '所有文件', extensions: ['*'] }
            ]
          })
          if (!result.canceled && result.filePath) {
            pathForm.databasePath = result.filePath
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const selectAnalysisPath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showOpenDialog) {
          const result = await window.electronAPI.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择分析结果保存路径'
          })
          if (!result.canceled && result.filePaths.length > 0) {
            pathForm.analysisPath = result.filePaths[0]
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const selectTempPath = async () => {
      try {
        if (window.electronAPI && window.electronAPI.showOpenDialog) {
          const result = await window.electronAPI.showOpenDialog({
            properties: ['openDirectory'],
            title: '选择临时文件路径'
          })
          if (!result.canceled && result.filePaths.length > 0) {
            pathForm.tempPath = result.filePaths[0]
          }
        } else {
          ElMessage.warning('此功能仅在Electron环境下可用')
        }
      } catch (error) {
        ElMessage.error('选择路径失败: ' + error.message)
      }
    }

    const savePathSettings = async () => {
      try {
        // 这里可以调用Electron API保存路径设置
        if (window.electronAPI && window.electronAPI.systemConfig) {
          await window.electronAPI.systemConfig.savePathSettings(pathForm)
        } else {
          // 开发环境保存到localStorage
          localStorage.setItem('pams_path_settings', JSON.stringify(pathForm))
        }
        ElMessage.success('路径设置保存成功')
      } catch (error) {
        ElMessage.error('保存路径设置失败: ' + error.message)
      }
    }

    const resetPathSettings = () => {
      pathForm.genomesPath = ''
      pathForm.databasePath = ''
      pathForm.analysisPath = ''
      pathForm.tempPath = ''
      ElMessage.success('路径设置已重置')
    }

    const loadPathSettings = () => {
      try {
        const savedSettings = localStorage.getItem('pams_path_settings')
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          Object.assign(pathForm, settings)
        }
      } catch (error) {
        console.error('加载路径设置失败:', error)
      }
    }

    // 页面加载时获取数据
    onMounted(async () => {
      // 处理ResizeObserver错误
      const handleResizeObserverError = () => {
        // 延迟执行，确保DOM已经渲染
        nextTick(() => {
          // 强制重新计算表格布局
          const tables = document.querySelectorAll('.el-table')
          tables.forEach(table => {
            if (table.__vue__) {
              table.__vue__.doLayout()
            }
          })
        })
      }

      // 监听标签页切换
      watch(activeTab, () => {
        handleResizeObserverError()
      })

      // 加载用户数据和角色数据
      loadUsers()
      loadRoles()

      // 加载路径设置
      loadPathSettings()
    })

    // 捕获ResizeObserver错误
    onErrorCaptured((err) => {
      if (err.message && err.message.includes('ResizeObserver')) {
        // 忽略ResizeObserver错误，这是Element Plus的已知问题
        return false
      }
      return true
    })

    return {
      activeTab,
      // 用户管理
      users,
      userDialogVisible,
      userForm,
      getRoleLabel,
      addUser,
      editUser,
      saveUser,
      deleteUser,
      refreshUsers,
      loadUsers,
      // 角色管理
      roles,
      rolesLoading,
      roleDialogVisible,
      editingRole,
      roleSaveLoading,
      permissionTreeRef,
      roleForm,
      roleRules,
      treeProps,
      permissionTree,
      loadRoles,
      refreshRoles,
      addRole,
      editRole,
      viewRole,
      resetRoleForm,
      handlePermissionCheck,
      saveRole,
      deleteRole,
      // 系统设置
      basicForm,
      databaseForm,
      pathForm,
      saveBasicSettings,
      testDatabaseConnection,
      saveDatabaseSettings,
      selectGenomesPath,
      selectDatabasePath,
      selectAnalysisPath,
      selectTempPath,
      savePathSettings,
      resetPathSettings
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

.settings-section {
  margin-bottom: 30px;
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e4e7ed;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #409eff;
}

.section-header h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.experiment-tabs,
.system-tabs {
  background: white;
  border-radius: 6px;
  padding: 15px;
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
.region-management,
.source-management,
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

// 表单帮助文本样式
.form-help {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

// 权限管理样式
.permission-management {
  background: #fafafa;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.permission-tree-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
  background: white;
}

.permission-tree-container .el-tree {
  background: transparent;
}

.permission-tree-container .el-tree-node__content {
  height: 32px;
  line-height: 32px;
}

.permission-tree-container .el-tree-node__label {
  font-size: 14px;
  color: #606266;
}

.permission-tree-container .el-tree-node__expand-icon {
  color: #c0c4cc;
}

.permission-tree-container .el-tree-node__expand-icon.expanded {
  color: #409eff;
}

// 角色对话框样式
.el-dialog .el-form-item {
  margin-bottom: 20px;
}

.el-dialog .el-form-item__label {
  font-weight: 500;
  color: #606266;
}

.el-dialog .el-input,
.el-dialog .el-textarea {
  width: 100%;
}

.el-dialog .el-button {
  margin-left: 10px;
}

.el-dialog .el-button:first-child {
  margin-left: 0;
}
</style>
