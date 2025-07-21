<template>
  <div class="user-management-container">
    <div class="page-header">
      <h1>用户管理</h1>
      <p>管理系统用户和权限</p>
    </div>

    <div class="content-area">
      <div class="toolbar">
        <el-button
          v-permission="'users.create'"
          type="primary"
          @click="addUser"
        >
          <el-icon><Plus /></el-icon>
          添加用户
        </el-button>
        <el-button @click="refreshUsers">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>

      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="用户名">
            <el-input
              v-model="filterForm.username"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>
          <el-form-item label="角色">
            <el-select
              v-model="filterForm.role"
              placeholder="请选择角色"
              clearable
            >
              <el-option label="全部" value="" />
              <el-option label="管理员" value="admin" />
              <el-option label="高级用户" value="advanced" />
              <el-option label="普通用户" value="user" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchUsers">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <div class="table-section">
        <el-table
          :data="users"
          v-loading="loading"
          element-loading-text="加载中..."
          border
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="username" label="用户名" width="120" />
          <el-table-column prop="role" label="角色" width="100">
            <template #default="scope">
              <el-tag
                :type="getRoleTagType(scope.row.role)"
                size="small"
              >
                {{ getRoleText(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180" />
          <el-table-column prop="last_login" label="最后登录" width="180" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag
                :type="scope.row.status === 'active' ? 'success' : 'danger'"
                size="small"
              >
                {{ scope.row.status === 'active' ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button
                v-permission="'users.edit'"
                size="small"
                @click="editUser(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-permission="'users.edit'"
                size="small"
                :type="scope.row.status === 'active' ? 'warning' : 'success'"
                @click="toggleUserStatus(scope.row)"
              >
                {{ scope.row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button
                v-permission="'users.delete'"
                size="small"
                type="danger"
                @click="deleteUser(scope.row)"
                :disabled="scope.row.id === currentUser.id"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pagination.current"
            v-model:page-size="pagination.size"
            :page-sizes="[10, 20, 50, 100]"
            :small="false"
            :disabled="loading"
            :background="true"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="userDialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select
            v-model="userForm.role"
            placeholder="请选择角色"
            style="width: 100%"
          >
            <el-option label="管理员" value="admin" />
            <el-option label="高级用户" value="advanced" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio label="active">正常</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="userDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'UserManagement',
  setup () {
    const store = useStore()
    const loading = ref(false)
    const users = ref([])
    const userDialogVisible = ref(false)
    const isEdit = ref(false)
    const userFormRef = ref(null)

    const filterForm = reactive({
      username: '',
      role: ''
    })

    const userForm = reactive({
      id: null,
      username: '',
      password: '',
      role: 'user',
      status: 'active'
    })

    const userFormRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择角色', trigger: 'change' }
      ]
    }

    const pagination = reactive({
      current: 1,
      size: 20,
      total: 0
    })

    const currentUser = computed(() => store.getters['auth/user'])

    const loadUsers = async () => {
      loading.value = true
      try {
        // TODO: 实现从后端加载用户数据的逻辑
        // 临时模拟数据
        users.value = [
          {
            id: 1,
            username: 'admin',
            role: 'admin',
            status: 'active',
            created_at: '2024-01-01 10:00:00',
            last_login: '2024-01-15 14:30:00'
          },
          {
            id: 2,
            username: 'advanced',
            role: 'advanced',
            status: 'active',
            created_at: '2024-01-02 11:00:00',
            last_login: '2024-01-14 09:15:00'
          },
          {
            id: 3,
            username: 'user',
            role: 'user',
            status: 'active',
            created_at: '2024-01-03 12:00:00',
            last_login: '2024-01-13 16:45:00'
          }
        ]
        pagination.total = 3
      } catch (error) {
        console.error('加载用户数据失败:', error)
        ElMessage.error('加载用户数据失败')
      } finally {
        loading.value = false
      }
    }

    const searchUsers = () => {
      pagination.current = 1
      loadUsers()
    }

    const resetFilter = () => {
      filterForm.username = ''
      filterForm.role = ''
      searchUsers()
    }

    const refreshUsers = () => {
      loadUsers()
    }

    const addUser = () => {
      isEdit.value = false
      userForm.id = null
      userForm.username = ''
      userForm.password = ''
      userForm.role = 'user'
      userForm.status = 'active'
      userDialogVisible.value = true
    }

    const editUser = (user) => {
      isEdit.value = true
      userForm.id = user.id
      userForm.username = user.username
      userForm.password = ''
      userForm.role = user.role
      userForm.status = user.status
      userDialogVisible.value = true
    }

    const saveUser = async () => {
      if (!userFormRef.value) return

      await userFormRef.value.validate(async (valid) => {
        if (!valid) return

        try {
          if (isEdit.value) {
            // TODO: 实现更新用户的逻辑
            ElMessage.success('用户更新成功')
          } else {
            // TODO: 实现创建用户的逻辑
            ElMessage.success('用户创建成功')
          }
          userDialogVisible.value = false
          loadUsers()
        } catch (error) {
          ElMessage.error(error.message || '保存失败')
        }
      })
    }

    const toggleUserStatus = async (user) => {
      try {
        const newStatus = user.status === 'active' ? 'disabled' : 'active'
        // TODO: 实现更新用户状态的逻辑
        user.status = newStatus
        ElMessage.success(`用户已${newStatus === 'active' ? '启用' : '禁用'}`)
      } catch (error) {
        ElMessage.error('操作失败')
      }
    }

    const deleteUser = async (user) => {
      try {
        await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 实现删除用户的逻辑
        ElMessage.success('删除成功')
        loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          ElMessage.error('删除失败')
        }
      }
    }

    const getRoleTagType = (role) => {
      const typeMap = {
        admin: 'danger',
        advanced: 'warning',
        user: 'info'
      }
      return typeMap[role] || 'info'
    }

    const getRoleText = (role) => {
      const textMap = {
        admin: '管理员',
        advanced: '高级用户',
        user: '普通用户'
      }
      return textMap[role] || '未知'
    }

    const handleSizeChange = (size) => {
      pagination.size = size
      loadUsers()
    }

    const handleCurrentChange = (current) => {
      pagination.current = current
      loadUsers()
    }

    onMounted(() => {
      loadUsers()
    })

    return {
      loading,
      users,
      filterForm,
      userForm,
      userFormRules,
      userFormRef,
      pagination,
      userDialogVisible,
      isEdit,
      currentUser,
      searchUsers,
      resetFilter,
      refreshUsers,
      addUser,
      editUser,
      saveUser,
      toggleUserStatus,
      deleteUser,
      getRoleTagType,
      getRoleText,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.user-management-container {
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

.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.dialog-footer {
  text-align: right;
}
</style>
