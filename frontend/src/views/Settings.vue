<template>
  <div class="settings-container">
    <div class="page-header">
      <h1>个人设置</h1>
      <p>修改个人信息和账户设置</p>
    </div>

    <div class="content-area">
      <el-tabs v-model="activeTab" type="card">
        <!-- 个人信息 -->
        <el-tab-pane label="个人信息" name="profile">
          <div class="profile-section">
            <div class="user-avatar">
              <el-avatar :size="80" :icon="UserFilled" />
              <div class="avatar-info">
                <h3>{{ user.username }}</h3>
                <el-tag :type="getRoleTagType(user.role)" size="small">
                  {{ getRoleText(user.role) }}
                </el-tag>
              </div>
            </div>

            <el-form :model="profileForm" :rules="profileRules" ref="profileFormRef" label-width="120px">
              <el-form-item label="用户名">
                <el-input v-model="profileForm.username" disabled />
              </el-form-item>
              <el-form-item label="用户名称" prop="displayName">
                <el-input
                  v-model="profileForm.displayName"
                  placeholder="请输入用户名称（可选）"
                  clearable
                />
              </el-form-item>
              <el-form-item label="实验室名称" prop="laboratory">
                <el-input
                  v-model="profileForm.laboratory"
                  placeholder="请输入实验室名称（可选）"
                  clearable
                />
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input
                  v-model="profileForm.email"
                  placeholder="请输入邮箱地址（可选）"
                  clearable
                />
              </el-form-item>
              <el-form-item label="联系电话" prop="phone">
                <el-input
                  v-model="profileForm.phone"
                  placeholder="请输入联系电话（可选）"
                  clearable
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveProfile" :loading="saving">
                  保存个人信息
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 修改密码 -->
        <el-tab-pane label="修改密码" name="password">
          <div class="password-section">
            <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px">
              <el-form-item label="当前密码" prop="currentPassword">
                <el-input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  placeholder="请输入当前密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input
                  v-model="passwordForm.newPassword"
                  type="password"
                  placeholder="请输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  show-password
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="changePassword" :loading="changingPassword">
                  修改密码
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 账户设置 -->
        <el-tab-pane label="账户设置" name="account">
          <div class="account-section">
            <el-form :model="accountForm" label-width="120px">
              <el-form-item label="语言设置">
                <el-select v-model="accountForm.language" placeholder="请选择语言">
                  <el-option label="中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                </el-select>
              </el-form-item>
              <el-form-item label="时区设置">
                <el-select v-model="accountForm.timezone" placeholder="请选择时区">
                  <el-option label="北京时间 (GMT+8)" value="Asia/Shanghai" />
                  <el-option label="UTC" value="UTC" />
                </el-select>
              </el-form-item>
              <el-form-item label="主题设置">
                <el-radio-group v-model="accountForm.theme">
                  <el-radio label="light">浅色主题</el-radio>
                  <el-radio label="dark">深色主题</el-radio>
                  <el-radio label="auto">跟随系统</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="数据显示">
                <el-switch
                  v-model="accountForm.showAdvancedData"
                  active-text="显示高级数据"
                  inactive-text="简化显示"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveAccountSettings">
                  保存账户设置
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { UserFilled } from '@element-plus/icons-vue'

export default {
  name: 'Settings',
  setup () {
    const store = useStore()
    const activeTab = ref('profile')
    const saving = ref(false)
    const changingPassword = ref(false)
    const profileFormRef = ref(null)
    const passwordFormRef = ref(null)

    const user = computed(() => store.getters['auth/user'] || {})

    const profileForm = reactive({
      username: '',
      displayName: '',
      laboratory: '',
      email: '',
      phone: ''
    })

    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const accountForm = reactive({
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      theme: 'light',
      showAdvancedData: true
    })

    const profileRules = {
      email: [
        { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
      ],
      phone: [
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
      ]
    }

    const passwordRules = {
      currentPassword: [
        { required: true, message: '请输入当前密码', trigger: 'blur' }
      ],
      newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
          validator: (rule, value, callback) => {
            if (value !== passwordForm.newPassword) {
              callback(new Error('两次输入的密码不一致'))
            } else {
              callback()
            }
          },
          trigger: 'blur'
        }
      ]
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

    const loadUserProfile = async () => {
      try {
        // 从用户信息加载数据
        profileForm.username = user.value.username || ''
        profileForm.displayName = user.value.displayName || ''
        profileForm.laboratory = user.value.laboratory || ''
        profileForm.email = user.value.email || ''
        profileForm.phone = user.value.phone || ''

        // 加载账户设置
        accountForm.language = user.value.language || 'zh-CN'
        accountForm.timezone = user.value.timezone || 'Asia/Shanghai'
        accountForm.theme = user.value.theme || 'light'
        accountForm.showAdvancedData = user.value.showAdvancedData !== false
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    }

    const saveProfile = async () => {
      if (!profileFormRef.value) return

      await profileFormRef.value.validate(async (valid) => {
        if (!valid) return

        saving.value = true
        try {
          // TODO: 实现保存用户信息的API调用
          if (window.electronAPI && window.electronAPI.users) {
            await window.electronAPI.users.updateProfile(user.value.id, {
              displayName: profileForm.displayName,
              laboratory: profileForm.laboratory,
              email: profileForm.email,
              phone: profileForm.phone
            })
          }

          // 更新store中的用户信息
          await store.dispatch('auth/updateUserProfile', {
            displayName: profileForm.displayName,
            laboratory: profileForm.laboratory,
            email: profileForm.email,
            phone: profileForm.phone
          })

          ElMessage.success('个人信息保存成功')
        } catch (error) {
          console.error('保存个人信息失败:', error)
          ElMessage.error('保存失败：' + (error.message || '未知错误'))
        } finally {
          saving.value = false
        }
      })
    }

    const changePassword = async () => {
      if (!passwordFormRef.value) return

      await passwordFormRef.value.validate(async (valid) => {
        if (!valid) return

        changingPassword.value = true
        try {
          // TODO: 实现修改密码的API调用
          if (window.electronAPI && window.electronAPI.auth) {
            await window.electronAPI.auth.changePassword(
              user.value.username,
              passwordForm.currentPassword,
              passwordForm.newPassword
            )
          }

          // 清空表单
          passwordForm.currentPassword = ''
          passwordForm.newPassword = ''
          passwordForm.confirmPassword = ''

          ElMessage.success('密码修改成功')
        } catch (error) {
          console.error('修改密码失败:', error)
          ElMessage.error('修改密码失败：' + (error.message || '当前密码不正确'))
        } finally {
          changingPassword.value = false
        }
      })
    }

    const saveAccountSettings = async () => {
      try {
        // TODO: 实现保存账户设置的API调用
        if (window.electronAPI && window.electronAPI.users) {
          await window.electronAPI.users.updateSettings(user.value.id, accountForm)
        }

        // 更新store中的用户设置
        await store.dispatch('auth/updateUserSettings', accountForm)

        ElMessage.success('账户设置保存成功')
      } catch (error) {
        console.error('保存账户设置失败:', error)
        ElMessage.error('保存失败：' + (error.message || '未知错误'))
      }
    }

    onMounted(() => {
      loadUserProfile()
    })

    return {
      activeTab,
      saving,
      changingPassword,
      profileFormRef,
      passwordFormRef,
      user,
      profileForm,
      passwordForm,
      accountForm,
      profileRules,
      passwordRules,
      getRoleTagType,
      getRoleText,
      saveProfile,
      changePassword,
      saveAccountSettings,
      UserFilled
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

  h1 {
    margin: 0 0 8px 0;
    color: #303133;
  }

  p {
    margin: 0;
    color: #606266;
  }
}

.content-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.profile-section {
  .user-avatar {
    display: flex;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: #f5f7fa;
    border-radius: 8px;

    .avatar-info {
      margin-left: 20px;

      h3 {
        margin: 0 0 8px 0;
        color: #303133;
      }
    }
  }

  .el-form {
    max-width: 600px;
  }
}

.password-section {
  .el-form {
    max-width: 600px;
  }
}

.account-section {
  .el-form {
    max-width: 600px;
  }
}

.el-form-item {
  margin-bottom: 20px;
}

.el-tabs {
  margin-top: 20px;
}

.el-tab-pane {
  padding: 20px 0;
}
</style>
