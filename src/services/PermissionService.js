/**
 * 权限管理服务
 * 实现基于角色的权限控制系统
 */

class PermissionService {
  constructor (databaseService) {
    this.db = databaseService
    this.initializePermissions()
  }

  /**
   * 初始化权限系统
   */
  initializePermissions () {
    // 定义系统权限
    this.permissions = {
      // 用户管理权限
      'users.view': '查看用户',
      'users.create': '创建用户',
      'users.edit': '编辑用户',
      'users.delete': '删除用户',
      'users.manage_roles': '管理用户角色',

      // 菌株管理权限
      'strains.view': '查看菌株',
      'strains.create': '创建菌株',
      'strains.edit': '编辑菌株',
      'strains.delete': '删除菌株',
      'strains.import': '导入菌株',
      'strains.export': '导出菌株',

      // 基因组管理权限
      'genomes.view': '查看基因组',
      'genomes.upload': '上传基因组',
      'genomes.download': '下载基因组',
      'genomes.delete': '删除基因组',
      'genomes.analyze': '分析基因组',

      // 分析功能权限
      'analysis.mlst': 'MLST分析',
      'analysis.resistance': '耐药基因分析',
      'analysis.virulence': '毒力基因分析',
      'analysis.serotyping': '血清分型分析',
      'analysis.view_results': '查看分析结果',
      'analysis.export_results': '导出分析结果',

      // 系统设置权限
      'settings.view': '查看系统设置',
      'settings.edit': '编辑系统设置',
      'settings.species_manage': '管理菌种配置',
      'settings.region_manage': '管理地区配置',
      'settings.source_manage': '管理样本来源配置',

      // 系统管理权限
      'system.backup': '系统备份',
      'system.restore': '系统恢复',
      'system.logs': '查看系统日志',
      'system.maintenance': '系统维护',

      // 报告权限
      'reports.view': '查看报告',
      'reports.generate': '生成报告',
      'reports.export': '导出报告'
    }

    // 定义角色及其权限
    this.roles = {
      admin: {
        name: '系统管理员',
        description: '拥有系统所有权限',
        permissions: Object.keys(this.permissions)
      },
      lab_manager: {
        name: '实验室管理员',
        description: '实验室管理权限',
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
      analyst: {
        name: '分析员',
        description: '生物信息分析权限',
        permissions: [
          'strains.view', 'strains.create', 'strains.edit',
          'genomes.view', 'genomes.upload', 'genomes.download', 'genomes.analyze',
          'analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping',
          'analysis.view_results', 'analysis.export_results',
          'settings.view',
          'reports.view', 'reports.generate', 'reports.export'
        ]
      },
      technician: {
        name: '技术员',
        description: '基础操作权限',
        permissions: [
          'strains.view', 'strains.create', 'strains.edit',
          'genomes.view', 'genomes.upload',
          'analysis.view_results',
          'settings.view',
          'reports.view'
        ]
      },
      viewer: {
        name: '查看者',
        description: '只读权限',
        permissions: [
          'strains.view',
          'genomes.view',
          'analysis.view_results',
          'settings.view',
          'reports.view'
        ]
      }
    }
  }

  /**
   * 获取所有权限
   */
  getAllPermissions () {
    return this.permissions
  }

  /**
   * 获取所有角色
   */
  getAllRoles () {
    return this.roles
  }

  /**
   * 获取角色权限
   */
  getRolePermissions (role) {
    return this.roles[role]?.permissions || []
  }

  /**
   * 检查用户是否有特定权限
   */
  hasPermission (userRole, permission) {
    const rolePermissions = this.getRolePermissions(userRole)
    return rolePermissions.includes(permission)
  }

  /**
   * 检查用户是否有任一权限
   */
  hasAnyPermission (userRole, permissions) {
    return permissions.some(permission => this.hasPermission(userRole, permission))
  }

  /**
   * 检查用户是否有所有权限
   */
  hasAllPermissions (userRole, permissions) {
    return permissions.every(permission => this.hasPermission(userRole, permission))
  }

  /**
   * 获取用户可访问的菜单
   */
  getUserMenus (userRole) {
    const permissions = this.getRolePermissions(userRole)
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
    if (this.hasAnyPermission(userRole, ['analysis.mlst', 'analysis.resistance', 'analysis.virulence', 'analysis.serotyping'])) {
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

      if (permissions.includes('analysis.virulence')) {
        analysisSubmenu.push({
          path: '/analysis/virulence',
          name: '毒力基因分析',
          component: 'Virulence'
        })
      }

      if (permissions.includes('analysis.serotyping')) {
        analysisSubmenu.push({
          path: '/analysis/serotyping',
          name: '血清分型分析',
          component: 'Serotyping'
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

    // 用户管理（仅管理员和实验室管理员）
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

  /**
   * 验证操作权限
   */
  validateOperation (userRole, operation, resource) {
    const permission = `${resource}.${operation}`
    return this.hasPermission(userRole, permission)
  }

  /**
   * 获取权限描述
   */
  getPermissionDescription (permission) {
    return this.permissions[permission] || permission
  }

  /**
   * 获取角色描述
   */
  getRoleDescription (role) {
    return this.roles[role]?.description || role
  }

  /**
   * 创建自定义角色
   */
  createCustomRole (roleName, roleData) {
    if (this.roles[roleName]) {
      throw new Error('角色已存在')
    }

    // 验证权限是否有效
    const invalidPermissions = roleData.permissions.filter(
      permission => !this.permissions[permission]
    )

    if (invalidPermissions.length > 0) {
      throw new Error(`无效的权限: ${invalidPermissions.join(', ')}`)
    }

    this.roles[roleName] = {
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions,
      custom: true
    }

    return this.roles[roleName]
  }

  /**
   * 更新自定义角色
   */
  updateCustomRole (roleName, roleData) {
    if (!this.roles[roleName] || !this.roles[roleName].custom) {
      throw new Error('只能修改自定义角色')
    }

    // 验证权限是否有效
    const invalidPermissions = roleData.permissions.filter(
      permission => !this.permissions[permission]
    )

    if (invalidPermissions.length > 0) {
      throw new Error(`无效的权限: ${invalidPermissions.join(', ')}`)
    }

    this.roles[roleName] = {
      ...this.roles[roleName],
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions
    }

    return this.roles[roleName]
  }

  /**
   * 删除自定义角色
   */
  deleteCustomRole (roleName) {
    if (!this.roles[roleName] || !this.roles[roleName].custom) {
      throw new Error('只能删除自定义角色')
    }

    delete this.roles[roleName]
    return true
  }
}

module.exports = PermissionService
