/**
 * 用户数据迁移工具
 * 用于清理和迁移localStorage中的旧用户数据到新的角色系统
 */

/**
 * 角色映射表：旧角色 -> 新角色
 */
const ROLE_MIGRATION_MAP = {
  admin: 'admin', // 管理员保持不变
  advanced: 'lab_manager', // 高级用户 -> 实验室管理员
  user: 'viewer' // 普通用户 -> 查看者
}

/**
 * 新角色系统的权限配置
 */
const NEW_ROLE_PERMISSIONS = {
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

/**
 * 迁移用户角色
 * @param {string} oldRole 旧角色
 * @returns {string} 新角色
 */
function migrateUserRole (oldRole) {
  return ROLE_MIGRATION_MAP[oldRole] || 'viewer'
}

/**
 * 获取角色对应的权限
 * @param {string} role 角色
 * @returns {Array} 权限列表
 */
function getRolePermissions (role) {
  return NEW_ROLE_PERMISSIONS[role] || NEW_ROLE_PERMISSIONS.viewer
}

/**
 * 迁移单个用户数据
 * @param {Object} user 用户对象
 * @returns {Object} 迁移后的用户对象
 */
function migrateUser (user) {
  const newRole = migrateUserRole(user.role)
  const newPermissions = getRolePermissions(newRole)

  return {
    ...user,
    role: newRole,
    permissions: newPermissions,
    migrated: true,
    migratedAt: new Date().toISOString()
  }
}

/**
 * 迁移localStorage中的注册用户数据
 */
function migrateRegisteredUsers () {
  try {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')

    if (registeredUsers.length === 0) {
      console.log('没有找到需要迁移的注册用户数据')
      return
    }

    let migratedCount = 0
    const migratedUsers = registeredUsers.map(user => {
      // 检查是否已经迁移过
      if (user.migrated) {
        return user
      }

      // 检查是否需要迁移（有旧角色）
      if (ROLE_MIGRATION_MAP[user.role] && ROLE_MIGRATION_MAP[user.role] !== user.role) {
        migratedCount++
        console.log(`迁移用户 ${user.username}: ${user.role} -> ${migrateUserRole(user.role)}`)
        return migrateUser(user)
      }

      // 如果角色已经是新系统的，只需要确保有正确的权限
      if (NEW_ROLE_PERMISSIONS[user.role]) {
        return {
          ...user,
          permissions: getRolePermissions(user.role),
          migrated: true,
          migratedAt: new Date().toISOString()
        }
      }

      // 未知角色，默认设为viewer
      console.log(`未知角色 ${user.role}，设置为 viewer`)
      migratedCount++
      return {
        ...user,
        role: 'viewer',
        permissions: getRolePermissions('viewer'),
        migrated: true,
        migratedAt: new Date().toISOString()
      }
    })

    // 保存迁移后的数据
    localStorage.setItem('registeredUsers', JSON.stringify(migratedUsers))

    if (migratedCount > 0) {
      console.log(`成功迁移 ${migratedCount} 个用户的角色数据`)
    } else {
      console.log('所有用户数据已经是最新格式')
    }

    return migratedUsers
  } catch (error) {
    console.error('迁移注册用户数据失败:', error)
    return []
  }
}

/**
 * 迁移当前登录用户数据
 */
function migrateCurrentUser () {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')

    if (!currentUser) {
      console.log('没有找到当前登录用户数据')
      return null
    }

    // 检查是否需要迁移
    if (currentUser.migrated) {
      return currentUser
    }

    const migratedUser = migrateUser(currentUser)
    localStorage.setItem('user', JSON.stringify(migratedUser))

    console.log(`迁移当前用户 ${currentUser.username}: ${currentUser.role} -> ${migratedUser.role}`)
    return migratedUser
  } catch (error) {
    console.error('迁移当前用户数据失败:', error)
    return null
  }
}

/**
 * 清理旧的缓存数据
 */
function cleanupOldData () {
  try {
    // 清理可能存在的旧缓存键
    const oldKeys = [
      'old_user_data',
      'legacy_roles',
      'cached_permissions'
    ]

    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`清理旧数据键: ${key}`)
      }
    })
  } catch (error) {
    console.error('清理旧数据失败:', error)
  }
}

/**
 * 执行完整的用户数据迁移
 */
export function migrateUserData () {
  console.log('开始用户数据迁移...')

  try {
    // 1. 迁移注册用户数据
    const migratedRegisteredUsers = migrateRegisteredUsers()

    // 2. 迁移当前用户数据
    const migratedCurrentUser = migrateCurrentUser()

    // 3. 清理旧数据
    cleanupOldData()

    console.log('用户数据迁移完成')

    return {
      success: true,
      registeredUsers: migratedRegisteredUsers,
      currentUser: migratedCurrentUser
    }
  } catch (error) {
    console.error('用户数据迁移失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 检查是否需要迁移
 */
export function needsMigration () {
  try {
    // 检查注册用户
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
    const hasUnmigratedRegisteredUsers = registeredUsers.some(user => !user.migrated)

    // 检查当前用户
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null')
    const hasUnmigratedCurrentUser = currentUser && !currentUser.migrated

    return hasUnmigratedRegisteredUsers || hasUnmigratedCurrentUser
  } catch (error) {
    console.error('检查迁移状态失败:', error)
    return false
  }
}

export default {
  migrateUserData,
  needsMigration,
  migrateUserRole,
  getRolePermissions
}
