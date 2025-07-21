/**
 * 路由权限守卫
 */

import store from '@/store'
import { ElMessage } from 'element-plus'

// 路由权限配置
const routePermissions = {
  // 用户管理
  '/users': ['users.view'],
  '/users/create': ['users.create'],
  '/users/edit': ['users.edit'],

  // 菌株管理
  '/strains': ['strains.view'],
  '/strains/create': ['strains.create'],
  '/strains/edit': ['strains.edit'],

  // 基因组管理
  '/genomes': ['genomes.view'],
  '/genomes/upload': ['genomes.upload'],

  // 分析功能
  '/analysis/mlst': ['analysis.mlst'],
  '/analysis/resistance': ['analysis.resistance'],
  '/analysis/virulence': ['analysis.virulence'],
  '/analysis/serotyping': ['analysis.serotyping'],

  // 系统设置
  '/settings': ['settings.view'],
  '/settings/species': ['settings.species_manage'],
  '/settings/regions': ['settings.region_manage'],
  '/settings/sources': ['settings.source_manage'],

  // 报告管理
  '/reports': ['reports.view'],
  '/reports/generate': ['reports.generate']
}

// 角色权限配置
const routeRoles = {
  '/admin': ['admin'],
  '/system': ['admin', 'lab_manager']
}

// 公开路由（不需要权限检查）
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/dashboard',
  '/profile',
  '/about'
]

/**
 * 检查路由权限
 */
export function checkRoutePermission (to, from, next) {
  // 检查是否是公开路由
  if (isPublicRoute(to.path)) {
    next()
    return
  }

  // 检查用户是否已登录
  const isAuthenticated = store.getters['auth/isAuthenticated']
  if (!isAuthenticated) {
    ElMessage.warning('请先登录')
    next('/login')
    return
  }

  // 检查角色权限
  const requiredRoles = getRequiredRoles(to.path)
  if (requiredRoles.length > 0) {
    const userRole = store.getters['permission/userRole']
    if (!requiredRoles.includes(userRole)) {
      ElMessage.error('您没有访问此页面的权限')
      next('/dashboard')
      return
    }
  }

  // 检查功能权限
  const requiredPermissions = getRequiredPermissions(to.path)
  if (requiredPermissions.length > 0) {
    const hasPermission = store.getters['permission/hasAnyPermission'](requiredPermissions)
    if (!hasPermission) {
      ElMessage.error('您没有访问此页面的权限')
      next('/dashboard')
      return
    }
  }

  next()
}

/**
 * 检查是否是公开路由
 */
function isPublicRoute (path) {
  return publicRoutes.some(route => {
    if (route === path) return true
    // 支持通配符匹配
    if (route.endsWith('*')) {
      const prefix = route.slice(0, -1)
      return path.startsWith(prefix)
    }
    return false
  })
}

/**
 * 获取路由所需权限
 */
function getRequiredPermissions (path) {
  // 精确匹配
  if (routePermissions[path]) {
    return routePermissions[path]
  }

  // 模糊匹配（匹配父路径）
  for (const route in routePermissions) {
    if (path.startsWith(route + '/')) {
      return routePermissions[route]
    }
  }

  return []
}

/**
 * 获取路由所需角色
 */
function getRequiredRoles (path) {
  // 精确匹配
  if (routeRoles[path]) {
    return routeRoles[path]
  }

  // 模糊匹配（匹配父路径）
  for (const route in routeRoles) {
    if (path.startsWith(route + '/')) {
      return routeRoles[route]
    }
  }

  return []
}

/**
 * 动态添加路由权限配置
 */
export function addRoutePermission (path, permissions) {
  routePermissions[path] = permissions
}

/**
 * 动态添加路由角色配置
 */
export function addRouteRole (path, roles) {
  routeRoles[path] = roles
}

/**
 * 获取用户可访问的菜单路由
 */
export function getAccessibleRoutes () {
  const userPermissions = store.getters['permission/userPermissions']
  const userRole = store.getters['permission/userRole']
  const accessibleRoutes = []

  // 添加公开路由
  accessibleRoutes.push(...publicRoutes)

  // 检查权限路由
  for (const route in routePermissions) {
    const requiredPermissions = routePermissions[route]
    const hasPermission = requiredPermissions.some(permission =>
      userPermissions.includes(permission)
    )
    if (hasPermission) {
      accessibleRoutes.push(route)
    }
  }

  // 检查角色路由
  for (const route in routeRoles) {
    const requiredRoles = routeRoles[route]
    if (requiredRoles.includes(userRole)) {
      accessibleRoutes.push(route)
    }
  }

  return [...new Set(accessibleRoutes)] // 去重
}

/**
 * 权限路由守卫中间件
 */
export function createPermissionGuard (router) {
  router.beforeEach(async (to, from, next) => {
    // 确保权限数据已加载
    const userPermissions = store.getters['permission/userPermissions']
    const isAuthenticated = store.getters['auth/isAuthenticated']

    if (isAuthenticated && userPermissions.length === 0) {
      try {
        await store.dispatch('permission/loadUserPermissions')
      } catch (error) {
        console.error('加载用户权限失败:', error)
      }
    }

    // 执行权限检查
    checkRoutePermission(to, from, next)
  })
}

/**
 * 检查页面操作权限
 */
export function checkPagePermission (permission) {
  const userPermissions = store.getters['permission/userPermissions']
  return userPermissions.includes(permission)
}

/**
 * 检查页面角色权限
 */
export function checkPageRole (role) {
  const userRole = store.getters['permission/userRole']
  if (Array.isArray(role)) {
    return role.includes(userRole)
  }
  return userRole === role
}

/**
 * 权限错误处理
 */
export function handlePermissionError (error) {
  console.error('权限错误:', error)
  ElMessage.error('权限验证失败，请重新登录')
  store.dispatch('auth/logout')
}

export default {
  checkRoutePermission,
  createPermissionGuard,
  checkPagePermission,
  checkPageRole,
  getAccessibleRoutes,
  addRoutePermission,
  addRouteRole,
  handlePermissionError
}
