<template>
  <div class="permission-control">
    <!-- 权限检查组件 -->
    <slot v-if="hasRequiredPermission" />
    
    <!-- 无权限时的提示 -->
    <div v-else-if="showNoPermissionMessage" class="no-permission-message">
      <el-empty 
        :image-size="100"
        :description="noPermissionText"
      >
        <template #image>
          <el-icon size="100" color="#c0c4cc">
            <Lock />
          </el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { Lock } from '@element-plus/icons-vue'

export default {
  name: 'PermissionControl',
  components: {
    Lock
  },
  props: {
    // 需要的权限（字符串或数组）
    permission: {
      type: [String, Array],
      default: null
    },
    // 需要的角色（字符串或数组）
    role: {
      type: [String, Array],
      default: null
    },
    // 权限检查模式：'any'（任一权限）或 'all'（所有权限）
    mode: {
      type: String,
      default: 'any',
      validator: value => ['any', 'all'].includes(value)
    },
    // 是否显示无权限提示信息
    showNoPermissionMessage: {
      type: Boolean,
      default: false
    },
    // 自定义无权限提示文本
    noPermissionText: {
      type: String,
      default: '您没有访问此内容的权限'
    }
  },
  setup (props) {
    const store = useStore()

    // 检查权限
    const hasRequiredPermission = computed(() => {
      // 如果没有指定权限和角色，默认允许访问
      if (!props.permission && !props.role) {
        return true
      }

      let hasPermission = true
      let hasRole = true

      // 检查权限
      if (props.permission) {
        const userPermissions = store.getters['permission/userPermissions']
        
        if (Array.isArray(props.permission)) {
          if (props.mode === 'all') {
            hasPermission = props.permission.every(p => userPermissions.includes(p))
          } else {
            hasPermission = props.permission.some(p => userPermissions.includes(p))
          }
        } else {
          hasPermission = userPermissions.includes(props.permission)
        }
      }

      // 检查角色
      if (props.role) {
        const userRole = store.getters['permission/userRole']
        
        if (Array.isArray(props.role)) {
          hasRole = props.role.includes(userRole)
        } else {
          hasRole = userRole === props.role
        }
      }

      return hasPermission && hasRole
    })

    return {
      hasRequiredPermission
    }
  }
}
</script>

<style scoped>
.permission-control {
  width: 100%;
}

.no-permission-message {
  padding: 40px 20px;
  text-align: center;
}

.no-permission-message .el-empty {
  padding: 0;
}
</style>
