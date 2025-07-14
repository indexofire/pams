// 使用Electron API
const electronAPI = window.electronAPI

const state = {
  user: null,
  isAuthenticated: false,
  token: null,
  permissions: []
}

const mutations = {
  SET_USER (state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  SET_TOKEN (state, token) {
    state.token = token
  },
  SET_PERMISSIONS (state, permissions) {
    state.permissions = permissions
  },
  LOGOUT (state) {
    state.user = null
    state.isAuthenticated = false
    state.token = null
    state.permissions = []
  }
}

const actions = {
  // 登录
  async login ({ commit }, { username, password, remember }) {
    try {
      let user

      if (electronAPI && electronAPI.auth) {
        // 使用Electron API进行认证
        user = await electronAPI.auth.login(username, password)
      } else {
        // 模拟认证逻辑（开发阶段）
        user = await simulateLogin(username, password)
      }

      commit('SET_USER', user)
      commit('SET_TOKEN', user.token)
      commit('SET_PERMISSIONS', user.permissions || [])

      // 如果选择记住密码，保存到localStorage
      if (remember) {
        localStorage.setItem('remembered_username', username)
        localStorage.setItem('remembered_password', password)
      } else {
        localStorage.removeItem('remembered_username')
        localStorage.removeItem('remembered_password')
      }

      // 保存用户信息到localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', user.token)

      return user
    } catch (error) {
      throw new Error(error.message || '登录失败')
    }
  },

  // 注册
  async register ({ commit }, { username, password, role }) {
    try {
      let user

      if (electronAPI && electronAPI.auth) {
        // 使用Electron API进行注册
        user = await electronAPI.auth.register(username, password, role)
      } else {
        // 模拟注册逻辑（开发阶段）
        user = await simulateRegister(username, password, role)
      }

      return user
    } catch (error) {
      throw new Error(error.message || '注册失败')
    }
  },

  // 退出登录
  async logout ({ commit }) {
    try {
      if (electronAPI && electronAPI.auth) {
        await electronAPI.auth.logout()
      }

      commit('LOGOUT')

      // 清除localStorage
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('remembered_username')
      localStorage.removeItem('remembered_password')
    } catch (error) {
      console.error('退出登录失败:', error)
    }
  },

  // 检查认证状态
  async checkAuth ({ commit }) {
    try {
      const savedUser = localStorage.getItem('user')
      const savedToken = localStorage.getItem('token')

      if (savedUser && savedToken) {
        const user = JSON.parse(savedUser)
        commit('SET_USER', user)
        commit('SET_TOKEN', savedToken)
        commit('SET_PERMISSIONS', user.permissions || [])
        return true
      }

      return false
    } catch (error) {
      console.error('检查认证状态失败:', error)
      return false
    }
  }
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  userRole: state => state.user?.role || 'user',
  permissions: state => state.permissions,
  hasPermission: (state) => (permission) => {
    return state.permissions.includes(permission)
  },
  isAdmin: state => state.user?.role === 'admin',
  isAdvanced: state => state.user?.role === 'advanced' || state.user?.role === 'admin',
  canUpload: state => state.user?.role === 'advanced' || state.user?.role === 'admin'
}

// 模拟登录函数（开发阶段使用）
async function simulateLogin (username, password) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 从localStorage获取注册用户
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')

  // 默认用户数据
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin']
    },
    {
      id: 2,
      username: 'advanced',
      password: 'advanced123',
      role: 'advanced',
      permissions: ['read', 'write']
    },
    {
      id: 3,
      username: 'user',
      password: 'user123',
      role: 'user',
      permissions: ['read']
    }
  ]

  // 合并默认用户和注册用户
  const allUsers = [...defaultUsers, ...registeredUsers]

  const user = allUsers.find(u => u.username === username && u.password === password)

  if (!user) {
    throw new Error('用户名或密码错误')
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    token: 'mock-token-' + Date.now()
  }
}

// 模拟注册函数（开发阶段使用）
async function simulateRegister (username, password, role) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 从localStorage获取现有注册用户
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')

  // 默认用户名列表
  const defaultUsernames = ['admin', 'advanced', 'user']

  // 检查用户名是否已存在（包括默认用户和注册用户）
  const existingUsernames = [...defaultUsernames, ...registeredUsers.map(u => u.username)]
  if (existingUsernames.includes(username)) {
    throw new Error('用户名已存在')
  }

  // 创建新用户
  const newUser = {
    id: Date.now(),
    username,
    password,
    role,
    permissions: role === 'admin' ? ['read', 'write', 'delete', 'admin'] : role === 'advanced' ? ['read', 'write'] : ['read']
  }

  // 将新用户添加到注册用户列表
  registeredUsers.push(newUser)

  // 保存到localStorage
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))

  // 返回用户信息（不包含密码）
  return {
    id: newUser.id,
    username: newUser.username,
    role: newUser.role,
    permissions: newUser.permissions
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
