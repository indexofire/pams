<template>
  <div class="login-container">
    <div class="login-box">
      <div class="logo-section">
        <h1>PAMS</h1>
        <p>病原菌分析管理系统</p>
      </div>

      <el-form
        :model="loginForm"
        :rules="loginRules"
        ref="loginFormRef"
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            size="large"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.remember">记住密码</el-checkbox>
          <el-link type="primary" class="forgot-password" @click="forgotPassword">忘记密码？</el-link>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            style="width: 100%"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="register-link">
          <span>还没有账号？</span>
          <el-link type="primary" @click="goToRegister">立即注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'

export default {
  name: 'Login',
  setup () {
    const router = useRouter()
    const store = useStore()
    const loginFormRef = ref(null)
    const loading = ref(false)

    const loginForm = reactive({
      username: '',
      password: '',
      remember: false
    })

    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return

      await loginFormRef.value.validate(async (valid) => {
        if (!valid) return

        loading.value = true
        try {
          await store.dispatch('auth/login', {
            username: loginForm.username,
            password: loginForm.password,
            remember: loginForm.remember
          })

          ElMessage.success('登录成功')
          router.push('/dashboard')
        } catch (error) {
          ElMessage.error(error.message || '登录失败')
        } finally {
          loading.value = false
        }
      })
    }

    const goToRegister = () => {
      router.push('/register')
    }

    const forgotPassword = () => {
      ElMessage.info('此功能暂未开放')
    }

    // 页面加载时检查是否已记住密码
    onMounted(() => {
      const savedUsername = localStorage.getItem('remembered_username')
      const savedPassword = localStorage.getItem('remembered_password')
      if (savedUsername && savedPassword) {
        loginForm.username = savedUsername
        loginForm.password = savedPassword
        loginForm.remember = true
      }
    })

    return {
      loginForm,
      loginRules,
      loginFormRef,
      loading,
      handleLogin,
      goToRegister,
      forgotPassword
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
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

.login-form .el-form-item {
  margin-bottom: 20px;
}

.login-form .el-form-item:last-child {
  margin-bottom: 0;
}

.forgot-password {
  float: right;
  font-size: 12px;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link .el-link {
  margin-left: 5px;
}
</style>
