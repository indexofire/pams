/**
 * 权限控制指令
 * 用法：
 * v-permission="'users.create'" - 检查单个权限
 * v-permission="['users.create', 'users.edit']" - 检查多个权限（任一）
 * v-permission-all="['users.create', 'users.edit']" - 检查多个权限（全部）
 */

import store from '@/store'

// 检查权限的核心函数
function checkPermission (el, binding, vnode) {
  const { value } = binding
  const permissions = store.getters['permission/userPermissions']

  if (value && value instanceof Array && value.length > 0) {
    // 数组权限检查
    const hasPermission = binding.name === 'permission-all'
      ? value.every(permission => permissions.includes(permission))
      : value.some(permission => permissions.includes(permission))

    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else if (typeof value === 'string') {
    // 单个权限检查
    const hasPermission = permissions.includes(value)
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    console.error('权限指令需要字符串或数组参数')
    el.parentNode && el.parentNode.removeChild(el)
  }
}

// v-permission 指令 - 检查任一权限
export const permission = {
  mounted (el, binding, vnode) {
    checkPermission(el, binding, vnode)
  },
  updated (el, binding, vnode) {
    checkPermission(el, binding, vnode)
  }
}

// v-permission-all 指令 - 检查所有权限
export const permissionAll = {
  mounted (el, binding, vnode) {
    binding.name = 'permission-all'
    checkPermission(el, binding, vnode)
  },
  updated (el, binding, vnode) {
    binding.name = 'permission-all'
    checkPermission(el, binding, vnode)
  }
}

// v-role 指令 - 检查用户角色
export const role = {
  mounted (el, binding, vnode) {
    const { value } = binding
    const userRole = store.getters['permission/userRole']

    if (value && value instanceof Array && value.length > 0) {
      const hasRole = value.includes(userRole)
      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string') {
      if (userRole !== value) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else {
      console.error('角色指令需要字符串或数组参数')
      el.parentNode && el.parentNode.removeChild(el)
    }
  },
  updated (el, binding, vnode) {
    const { value } = binding
    const userRole = store.getters['permission/userRole']

    if (value && value instanceof Array && value.length > 0) {
      const hasRole = value.includes(userRole)
      if (!hasRole) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    } else if (typeof value === 'string') {
      if (userRole !== value) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  }
}

// 权限检查函数（在JS中使用）
export function hasPermission (permission) {
  const permissions = store.getters['permission/userPermissions']
  return permissions.includes(permission)
}

export function hasAnyPermission (permissionList) {
  const permissions = store.getters['permission/userPermissions']
  return permissionList.some(permission => permissions.includes(permission))
}

export function hasAllPermissions (permissionList) {
  const permissions = store.getters['permission/userPermissions']
  return permissionList.every(permission => permissions.includes(permission))
}

export function hasRole (role) {
  const userRole = store.getters['permission/userRole']
  if (Array.isArray(role)) {
    return role.includes(userRole)
  }
  return userRole === role
}

// 默认导出所有指令
export default {
  permission,
  permissionAll,
  role
}
