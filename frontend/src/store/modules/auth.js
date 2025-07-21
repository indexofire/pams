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
      // 不在这里设置权限，让permission store来管理
      // commit('SET_PERMISSIONS', user.permissions || [])

      // 加载用户权限
      await this.dispatch('permission/loadUserPermissions')

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

      // 清除权限数据
      await this.dispatch('permission/clearPermissions')

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
        // 不在这里设置权限，让permission store来管理
        // commit('SET_PERMISSIONS', user.permissions || [])

        // 加载用户权限
        await this.dispatch('permission/loadUserPermissions')
        return true
      }

      return false
    } catch (error) {
      console.error('检查认证状态失败:', error)
      return false
    }
  },

  // 更新用户资料
  async updateUserProfile ({ commit, state }, profileData) {
    try {
      let updatedUser

      if (electronAPI && electronAPI.users) {
        // 使用Electron API更新用户资料
        updatedUser = await electronAPI.users.updateProfile(state.user.id, profileData)
      } else {
        // 模拟更新用户资料（开发阶段）
        updatedUser = await simulateUpdateProfile(state.user, profileData)
      }

      // 更新store中的用户信息
      const newUser = { ...state.user, ...updatedUser }
      commit('SET_USER', newUser)

      // 更新localStorage
      localStorage.setItem('user', JSON.stringify(newUser))

      return updatedUser
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  },

  // 更改密码
  async changePassword ({ state }, { currentPassword, newPassword }) {
    try {
      if (electronAPI && electronAPI.auth) {
        // 使用Electron API更改密码
        await electronAPI.auth.changePassword(state.user.username, currentPassword, newPassword)
      } else {
        // 模拟更改密码（开发阶段）
        await simulateChangePassword(state.user, currentPassword, newPassword)
      }

      return true
    } catch (error) {
      console.error('更改密码失败:', error)
      throw error
    }
  },

  // 更新用户设置
  async updateUserSettings ({ commit, state }, settingsData) {
    try {
      let updatedUser

      if (electronAPI && electronAPI.users) {
        // 使用Electron API更新用户设置
        updatedUser = await electronAPI.users.updateSettings(state.user.id, settingsData)
      } else {
        // 模拟更新用户设置（开发阶段）
        updatedUser = await simulateUpdateSettings(state.user, settingsData)
      }

      // 更新store中的用户信息
      const newUser = { ...state.user, ...updatedUser }
      commit('SET_USER', newUser)

      // 更新localStorage
      localStorage.setItem('user', JSON.stringify(newUser))

      return updatedUser
    } catch (error) {
      console.error('更新用户设置失败:', error)
      throw error
    }
  }
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  user: state => state.user,
  userRole: state => state.user?.role || 'viewer',
  permissions: state => state.permissions,
  hasPermission: (state) => (permission) => {
    return state.permissions.includes(permission)
  },
  isAdmin: state => state.user?.role === 'admin',
  isAdvanced: state => state.user?.role === 'lab_manager' || state.user?.role === 'admin',
  canUpload: state => state.user?.role === 'lab_manager' || state.user?.role === 'admin'
}

// 模拟登录函数（开发阶段使用）
async function simulateLogin (username, password) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 1000))

  // 从localStorage获取注册用户
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')

  // 默认用户数据 - 使用与后端相同的权限系统
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      permissions: [
        'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
        'strains.view', 'strains.create', 'strains.edit', 'strains.delete', 'strains.import', 'strains.export',
        'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.delete', 'genomes.analyze',
        'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping',
        'analysis.view_results', 'analysis.export_results',
        'settings.view', 'settings.edit', 'settings.species_manage', 'settings.region_manage', 'settings.source_manage',
        'system.backup', 'system.restore', 'system.logs', 'system.maintenance',
        'reports.view', 'reports.generate', 'reports.export'
      ]
    },
    {
      id: 2,
      username: 'advanced',
      password: 'advanced123',
      role: 'lab_manager',
      permissions: [
        'users.view', 'users.create', 'users.edit',
        'strains.view', 'strains.create', 'strains.edit', 'strains.delete', 'strains.import', 'strains.export',
        'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.delete', 'genomes.analyze',
        'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping',
        'analysis.view_results', 'analysis.export_results',
        'settings.view', 'settings.species_manage', 'settings.region_manage', 'settings.source_manage',
        'reports.view', 'reports.generate', 'reports.export'
      ]
    },
    {
      id: 3,
      username: 'user',
      password: 'user123',
      role: 'viewer',
      permissions: [
        'strains.view',
        'genomes.view',
        'analysis.view_results',
        'settings.view',
        'reports.view'
      ]
    }
  ]

  // 首先检查默认用户，然后检查注册用户（确保默认用户优先级更高）
  let user = defaultUsers.find(u => u.username === username && u.password === password)

  if (!user) {
    // 如果默认用户中没有找到，再从注册用户中查找
    user = registeredUsers.find(u => u.username === username && u.password === password)
  }

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

  // 创建新用户 - 使用与后端相同的权限系统
  const rolePermissions = {
    admin: [
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage_roles',
      'strains.view', 'strains.create', 'strains.edit', 'strains.delete', 'strains.import', 'strains.export',
      'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.delete', 'genomes.analyze',
      'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping',
      'analysis.view_results', 'analysis.export_results',
      'settings.view', 'settings.edit', 'settings.species_manage', 'settings.region_manage', 'settings.source_manage',
      'system.backup', 'system.restore', 'system.logs', 'system.maintenance',
      'reports.view', 'reports.generate', 'reports.export'
    ],
    lab_manager: [
      'users.view', 'users.create', 'users.edit',
      'strains.view', 'strains.create', 'strains.edit', 'strains.delete', 'strains.import', 'strains.export',
      'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.delete', 'genomes.analyze',
      'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping',
      'analysis.view_results', 'analysis.export_results',
      'settings.view', 'settings.species_manage', 'settings.region_manage', 'settings.source_manage',
      'reports.view', 'reports.generate', 'reports.export'
    ],
    analyst: [
      'strains.view', 'strains.create', 'strains.edit',
      'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.analyze',
      'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping',
      'analysis.view_results', 'analysis.export_results',
      'settings.view',
      'reports.view', 'reports.generate', 'reports.export'
    ],
    technician: [
      'strains.view', 'strains.create', 'strains.edit',
      'genomes.view', 'genomes.upload',
      'analysis.view_results',
      'settings.view',
      'reports.view'
    ],
    viewer: [
      'strains.view',
      'genomes.view',
      'analysis.view_results',
      'settings.view',
      'reports.view'
    ]
  }

  const newUser = {
    id: Date.now(),
    username,
    password,
    role,
    permissions: rolePermissions[role] || rolePermissions.viewer
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

// 模拟更新用户资料函数（开发阶段使用）
async function simulateUpdateProfile (currentUser, profileData) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 获取注册用户数据
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')

  // 更新用户信息
  const updatedProfile = {
    displayName: profileData.displayName,
    laboratory: profileData.laboratory,
    email: profileData.email,
    phone: profileData.phone
  }

  // 如果是注册用户，更新localStorage中的数据
  if (currentUser.id > 3) {
    const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id)
    if (userIndex !== -1) {
      registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...updatedProfile }
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    }
  }

  return updatedProfile
}

// 模拟更改密码函数（开发阶段使用）
async function simulateChangePassword (currentUser, currentPassword, newPassword) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 获取所有用户数据
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
    { id: 2, username: 'advanced', password: 'advanced123', role: 'advanced' },
    { id: 3, username: 'user', password: 'user123', role: 'user' }
  ]

  // 验证当前密码
  let userToUpdate = null
  if (currentUser.id <= 3) {
    userToUpdate = defaultUsers.find(u => u.id === currentUser.id)
  } else {
    userToUpdate = registeredUsers.find(u => u.id === currentUser.id)
  }

  if (!userToUpdate || userToUpdate.password !== currentPassword) {
    throw new Error('当前密码不正确')
  }

  // 更新密码
  if (currentUser.id > 3) {
    const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id)
    if (userIndex !== -1) {
      registeredUsers[userIndex].password = newPassword
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    }
  } else {
    // 对于默认用户，我们不能真正更新密码，只是模拟成功
    console.warn('默认用户密码更改仅为模拟，实际未更新')
  }

  return true
}

// 模拟更新用户设置函数（开发阶段使用）
async function simulateUpdateSettings (currentUser, settingsData) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 获取注册用户数据
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')

  // 更新用户设置
  const updatedSettings = {
    language: settingsData.language,
    timezone: settingsData.timezone,
    theme: settingsData.theme,
    showAdvancedData: settingsData.showAdvancedData
  }

  // 如果是注册用户，更新localStorage中的数据
  if (currentUser.id > 3) {
    const userIndex = registeredUsers.findIndex(u => u.id === currentUser.id)
    if (userIndex !== -1) {
      registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...updatedSettings }
      localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers))
    }
  }

  return updatedSettings
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
