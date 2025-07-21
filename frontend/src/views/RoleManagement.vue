<template>
  <div class="role-management">
    <div class="page-header">
      <h1>角色权限管理</h1>
      <p>管理系统角色和权限分配</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button
          v-permission="'users.manage_roles'"
          type="primary"
          @click="showCreateDialog = true"
        >
          <el-icon><Plus /></el-icon>
          创建角色
        </el-button>
        <el-button @click="loadRoles">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <!-- 角色列表 -->
      <el-table
        :data="roles"
        style="width: 100%"
        v-loading="loading"
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
              v-permission="'users.manage_roles'"
              size="small"
              @click="editRole(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="scope.row.custom"
              v-permission="'users.manage_roles'"
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

    <!-- 创建/编辑角色对话框 -->
    <el-dialog
      :title="editingRole ? '编辑角色' : '创建角色'"
      v-model="showCreateDialog"
      width="800px"
      @close="resetForm"
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
        <el-form-item label="权限配置">
          <div class="permission-tree">
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
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button
          type="primary"
          @click="saveRole"
          :loading="saving"
        >
          {{ editingRole ? '更新' : '创建' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看角色详情对话框 -->
    <el-dialog
      title="角色详情"
      v-model="showViewDialog"
      width="600px"
    >
      <div v-if="viewingRole">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="角色名称">
            {{ viewingRole.name }}
          </el-descriptions-item>
          <el-descriptions-item label="角色描述">
            {{ viewingRole.description }}
          </el-descriptions-item>
          <el-descriptions-item label="角色类型">
            <el-tag :type="viewingRole.custom ? 'warning' : 'success'">
              {{ viewingRole.custom ? '自定义角色' : '系统角色' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="权限列表">
            <div class="permission-list">
              <el-tag
                v-for="permission in viewingRole.permissions"
                :key="permission"
                style="margin: 2px"
                size="small"
              >
                {{ getPermissionName(permission) }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { validateInput } from '@/utils/validation'

export default {
  name: 'RoleManagement',
  components: {
    Plus,
    Refresh
  },
  setup () {
    const store = useStore()

    // 响应式数据
    const loading = ref(false)
    const saving = ref(false)
    const showCreateDialog = ref(false)
    const showViewDialog = ref(false)
    const editingRole = ref(null)
    const viewingRole = ref(null)
    const roleFormRef = ref(null)
    const permissionTreeRef = ref(null)

    const roles = ref([])
    const allPermissions = ref({})

    const roleForm = reactive({
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
        { max: 200, message: '描述长度不能超过 200 个字符', trigger: 'blur' }
      ]
    }

    const treeProps = {
      children: 'children',
      label: 'label'
    }

    // 计算属性
    const permissionTree = computed(() => {
      const tree = []
      const permissions = allPermissions.value

      // 按模块分组权限
      const groups = {
        users: { label: '用户管理', children: [] },
        strains: { label: '菌株管理', children: [] },
        genomes: { label: '基因组管理', children: [] },
        analysis: { label: '分析功能', children: [] },
        settings: { label: '系统设置', children: [] },
        system: { label: '系统管理', children: [] },
        reports: { label: '报告管理', children: [] }
      }

      Object.keys(permissions).forEach(key => {
        const [module] = key.split('.')
        if (groups[module]) {
          groups[module].children.push({
            id: key,
            label: permissions[key]
          })
        }
      })

      Object.keys(groups).forEach(key => {
        if (groups[key].children.length > 0) {
          groups[key].id = key
          tree.push(groups[key])
        }
      })

      return tree
    })

    // 方法
    const loadRoles = async () => {
      try {
        loading.value = true
        await store.dispatch('permission/loadAvailableRolesAndPermissions')
        const rolesData = store.getters['permission/availableRoles']
        allPermissions.value = store.getters['permission/availablePermissions']

        roles.value = Object.keys(rolesData).map(key => ({
          key,
          ...rolesData[key]
        }))
      } catch (error) {
        console.error('加载角色失败:', error)
        ElMessage.error('加载角色失败')
      } finally {
        loading.value = false
      }
    }

    const viewRole = (role) => {
      viewingRole.value = role
      showViewDialog.value = true
    }

    const editRole = (role) => {
      editingRole.value = role
      roleForm.name = role.name
      roleForm.description = role.description
      roleForm.permissions = [...(role.permissions || [])]
      showCreateDialog.value = true
    }

    const deleteRole = async (role) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除角色 "${role.name}" 吗？此操作不可恢复。`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )

        // TODO: 调用删除角色的API
        ElMessage.success('角色删除成功')
        await loadRoles()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除角色失败:', error)
          ElMessage.error('删除角色失败')
        }
      }
    }

    const handlePermissionCheck = (data, checked) => {
      const checkedKeys = permissionTreeRef.value.getCheckedKeys()
      roleForm.permissions = checkedKeys
    }

    const saveRole = async () => {
      try {
        // 表单验证
        await roleFormRef.value.validate()

        // 输入安全验证
        const nameValidation = validateInput(roleForm.name, {
          required: true,
          minLength: 2,
          maxLength: 50,
          label: '角色名称'
        })

        if (!nameValidation.valid) {
          ElMessage.error(nameValidation.errors[0])
          return
        }

        const descValidation = validateInput(roleForm.description, {
          required: true,
          maxLength: 200,
          label: '角色描述'
        })

        if (!descValidation.valid) {
          ElMessage.error(descValidation.errors[0])
          return
        }

        saving.value = true

        // TODO: 调用创建/更新角色的API
        const roleData = {
          name: roleForm.name.trim(),
          description: roleForm.description.trim(),
          permissions: roleForm.permissions
        }

        if (editingRole.value) {
          // 更新角色
          console.log('更新角色:', roleData)
          ElMessage.success('角色更新成功')
        } else {
          // 创建角色
          console.log('创建角色:', roleData)
          ElMessage.success('角色创建成功')
        }

        showCreateDialog.value = false
        await loadRoles()
      } catch (error) {
        console.error('保存角色失败:', error)
        ElMessage.error('保存角色失败')
      } finally {
        saving.value = false
      }
    }

    const resetForm = () => {
      editingRole.value = null
      roleForm.name = ''
      roleForm.description = ''
      roleForm.permissions = []
      if (roleFormRef.value) {
        roleFormRef.value.resetFields()
      }
    }

    const getPermissionName = (permission) => {
      return allPermissions.value[permission] || permission
    }

    // 生命周期
    onMounted(() => {
      loadRoles()
    })

    return {
      loading,
      saving,
      showCreateDialog,
      showViewDialog,
      editingRole,
      viewingRole,
      roleFormRef,
      permissionTreeRef,
      roles,
      roleForm,
      roleRules,
      treeProps,
      permissionTree,
      loadRoles,
      viewRole,
      editRole,
      deleteRole,
      handlePermissionCheck,
      saveRole,
      resetForm,
      getPermissionName
    }
  }
}
</script>

<style scoped>
.role-management {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.content-area {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toolbar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.permission-tree {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.permission-list {
  max-height: 200px;
  overflow-y: auto;
}
</style>
