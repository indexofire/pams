<template>
  <div class="register-container">
    <div class="register-box">
      <div class="logo-section">
        <h1>PAMS</h1>
        <p>病原菌分析管理系统</p>
      </div>

      <el-form
        :model="registerForm"
        :rules="registerRules"
        ref="registerFormRef"
        class="register-form"
        @submit.prevent="handleRegister"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item prop="role">
          <el-select
            v-model="registerForm.role"
            placeholder="选择用户角色"
            size="large"
            style="width: 100%"
          >
            <el-option label="查看者" value="viewer" />
            <el-option label="技术员" value="technician" />
            <el-option label="分析师" value="analyst" />
            <el-option label="实验室管理员" value="lab_manager" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="login-link">
          <span>已有账号？</span>
          <el-link type="primary" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'Register',
  setup () {
    const router = useRouter()
    const store = useStore()
    const registerFormRef = ref(null)
    const loading = ref(false)

    const registerForm = reactive({
      username: '',
      password: '',
      confirmPassword: '',
      role: 'viewer'
    })

    const validatePassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6个字符'))
      } else {
        callback()
      }
    }

    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== registerForm.password) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    }

    const registerRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, validator: validatePassword, trigger: 'blur' }
      ],
      confirmPassword: [
        { required: true, validator: validateConfirmPassword, trigger: 'blur' }
      ],
      role: [
        { required: true, message: '请选择用户角色', trigger: 'change' }
      ]
    }

    const handleRegister = async () => {
      if (!registerFormRef.value) return

      await registerFormRef.value.validate(async (valid) => {
        if (!valid) return

        loading.value = true
        try {
          await store.dispatch('auth/register', {
            username: registerForm.username,
            password: registerForm.password,
            role: registerForm.role
          })

          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } catch (error) {
          ElMessage.error(error.message || '注册失败')
        } finally {
          loading.value = false
        }
      })
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      registerForm,
      registerRules,
      registerFormRef,
      loading,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo-section h1 {
  font-size: 36px;
  color: #409EFF;
  margin: 0;
  font-weight: bold;
}

.logo-section p {
  color: #666;
  margin: 10px 0 0 0;
  font-size: 14px;
}

.register-form .el-form-item {
  margin-bottom: 20px;
}

.register-form .el-form-item:last-child {
  margin-bottom: 0;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link .el-link {
  margin-left: 5px;
}
</style>
