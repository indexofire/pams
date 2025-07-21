/**
 * 权限管理 Vuex 模块
 */

const state = {
  // 用户权限列表
  permissions: [],
  // 用户角色
  userRole: null,
  // 可访问的菜单
  accessibleMenus: [],
  // 所有可用角色
  availableRoles: {},
  // 所有可用权限
  availablePermissions: {}
}

const mutations = {
  SET_PERMISSIONS (state, permissions) {
    state.permissions = permissions
  },

  SET_USER_ROLE (state, role) {
    state.userRole = role
  },

  SET_ACCESSIBLE_MENUS (state, menus) {
    state.accessibleMenus = menus
  },

  SET_AVAILABLE_ROLES (state, roles) {
    state.availableRoles = roles
  },

  SET_AVAILABLE_PERMISSIONS (state, permissions) {
    state.availablePermissions = permissions
  },

  CLEAR_PERMISSIONS (state) {
    state.permissions = []
    state.userRole = null
    state.accessibleMenus = []
  }
}

const actions = {
  // 加载用户权限
  async loadUserPermissions ({ commit, rootState }) {
    try {
      const currentUser = rootState.user.currentUser
      if (!currentUser) {
        commit('CLEAR_PERMISSIONS')
        return
      }

      if (window.electronAPI && window.electronAPI.users) {
        // Electron 环境
        const permissions = await window.electronAPI.users.getUserPermissions(currentUser.id)
        const menus = await window.electronAPI.users.getUserMenus(currentUser.id)

        commit('SET_PERMISSIONS', permissions)
        commit('SET_USER_ROLE', currentUser.role)
        commit('SET_ACCESSIBLE_MENUS', menus)
      } else {
        // 浏览器环境 - 模拟权限数据
        const mockPermissions = getMockPermissions(currentUser.role)
        const mockMenus = getMockMenus(currentUser.role)

        commit('SET_PERMISSIONS', mockPermissions)
        commit('SET_USER_ROLE', currentUser.role)
        commit('SET_ACCESSIBLE_MENUS', mockMenus)
      }
    } catch (error) {
      console.error('加载用户权限失败:', error)
      commit('CLEAR_PERMISSIONS')
    }
  },

  // 加载所有可用角色和权限
  async loadAvailableRolesAndPermissions ({ commit }) {
    try {
      if (window.electronAPI && window.electronAPI.users) {
        // Electron 环境
        const roles = await window.electronAPI.users.getAllRoles()
        const permissions = await window.electronAPI.users.getAllPermissions()

        commit('SET_AVAILABLE_ROLES', roles)
        commit('SET_AVAILABLE_PERMISSIONS', permissions)
      } else {
        // 浏览器环境 - 模拟数据
        const mockRoles = getMockRoles()
        const mockPermissions = getMockAllPermissions()

        commit('SET_AVAILABLE_ROLES', mockRoles)
        commit('SET_AVAILABLE_PERMISSIONS', mockPermissions)
      }
    } catch (error) {
      console.error('加载角色和权限数据失败:', error)
    }
  },

  // 检查权限
  checkPermission ({ state }, permission) {
    return state.permissions.includes(permission)
  },

  // 检查任一权限
  checkAnyPermission ({ state }, permissions) {
    return permissions.some(permission => state.permissions.includes(permission))
  },

  // 检查所有权限
  checkAllPermissions ({ state }, permissions) {
    return permissions.every(permission => state.permissions.includes(permission))
  },

  // 清除权限数据
  clearPermissions ({ commit }) {
    commit('CLEAR_PERMISSIONS')
  }
}

const getters = {
  // 获取用户权限
  userPermissions: state => state.permissions,

  // 获取用户角色
  userRole: state => state.userRole,

  // 获取可访问菜单
  accessibleMenus: state => state.accessibleMenus,

  // 获取可用角色
  availableRoles: state => state.availableRoles,

  // 获取可用权限
  availablePermissions: state => state.availablePermissions,

  // 检查是否有权限
  hasPermission: state => permission => {
    return state.permissions.includes(permission)
  },

  // 检查是否有任一权限
  hasAnyPermission: state => permissions => {
    return permissions.some(permission => state.permissions.includes(permission))
  },

  // 检查是否有所有权限
  hasAllPermissions: state => permissions => {
    return permissions.every(permission => state.permissions.includes(permission))
  },

  // 检查是否是管理员
  isAdmin: state => {
    return state.userRole === 'admin'
  },

  // 检查是否是实验室管理员
  isLabManager: state => {
    return state.userRole === 'lab_manager'
  }
}

// 模拟权限数据（浏览器环境使用）
function getMockPermissions (role) {
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

  return rolePermissions[role] || []
}

function getMockMenus (role) {
  const permissions = getMockPermissions(role)
  const menus = []

  // 仪表板（所有用户都可访问）
  menus.push({
    path: '/dashboard',
    name: '仪表板',
    icon: 'Dashboard',
    component: 'Dashboard'
  })

  // 菌株管理
  if (permissions.includes('strains.view')) {
    menus.push({
      path: '/strains',
      name: '菌株管理',
      icon: 'Experiment',
      component: 'Strains'
    })
  }

  // 基因组管理
  if (permissions.includes('genomes.view')) {
    menus.push({
      path: '/genomes',
      name: '基因组数据',
      icon: 'Document',
      component: 'Genomes'
    })
  }

  // 分析功能
  const analysisPermissions = ['analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping']
  if (analysisPermissions.some(p => permissions.includes(p))) {
    const analysisSubmenu = []

    if (permissions.includes('analysis.mlst')) {
      analysisSubmenu.push({
        path: '/analysis/mlst',
        name: 'MLST分析',
        component: 'MLST'
      })
    }

    if (permissions.includes('analysis.resistance')) {
      analysisSubmenu.push({
        path: '/analysis/resistance',
        name: '耐药基因分析',
        component: 'Resistance'
      })
    }

    menus.push({
      path: '/analysis',
      name: '生信分析',
      icon: 'DataAnalysis',
      children: analysisSubmenu
    })
  }

  // 报告功能
  if (permissions.includes('reports.view')) {
    menus.push({
      path: '/reports',
      name: '报告管理',
      icon: 'Document',
      component: 'Reports'
    })
  }

  // 系统设置
  if (permissions.includes('settings.view')) {
    menus.push({
      path: '/settings',
      name: '系统设置',
      icon: 'Setting',
      component: 'AdminSettings'
    })
  }

  // 用户管理
  if (permissions.includes('users.view')) {
    menus.push({
      path: '/users',
      name: '用户管理',
      icon: 'User',
      component: 'UserManagement'
    })
  }

  return menus
}

function getMockRoles () {
  return {
    admin: {
      name: '系统管理员',
      description: '拥有系统所有权限'
    },
    lab_manager: {
      name: '实验室管理员',
      description: '实验室管理权限'
    },
    analyst: {
      name: '分析员',
      description: '生物信息分析权限'
    },
    technician: {
      name: '技术员',
      description: '基础操作权限'
    },
    viewer: {
      name: '查看者',
      description: '只读权限'
    }
  }
}

function getMockAllPermissions () {
  return {
    'users.view': '查看用户',
    'users.create': '创建用户',
    'users.edit': '编辑用户',
    'users.delete': '删除用户',
    'strains.view': '查看菌株',
    'strains.create': '创建菌株',
    'strains.edit': '编辑菌株',
    'strains.delete': '删除菌株',
    'genomes.view': '查看基因组',
    'genomes.upload': '上传基因组',
    'genomes.analyze': '分析基因组',
    'analysis.mlst': 'MLST分析',
    'analysis.resistance': '耐药基因分析',
    'settings.view': '查看系统设置',
    'settings.edit': '编辑系统设置',
    'reports.view': '查看报告',
    'reports.generate': '生成报告'
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
