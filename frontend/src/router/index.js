import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
// store 导入已移至 permission.js 中统一管理

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表板', requiresAuth: true }
  },
  {
    path: '/strains',
    name: 'Strains',
    component: () => import('../views/Strains.vue'),
    meta: { title: '菌株管理', requiresAuth: true }
  },
  {
    path: '/strain-analysis',
    name: 'StrainAnalysis',
    component: () => import('../views/StrainAnalysis.vue'),
    meta: { title: '菌株筛选分析', requiresAuth: true }
  },
  {
    path: '/genomes',
    name: 'Genomes',
    component: () => import('../views/Genomes.vue'),
    meta: { title: '基因组数据', requiresAuth: true }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('../views/Analysis.vue'),
    meta: { title: '生信分析', requiresAuth: true },
    children: [
      {
        path: 'annotation',
        name: 'Annotation',
        component: () => import('../views/analysis/Annotation.vue'),
        meta: { title: '基因组注释', requiresAuth: true }
      },
      {
        path: 'mlst',
        name: 'MLST',
        component: () => import('../views/analysis/MLST.vue'),
        meta: { title: 'MLST分型', requiresAuth: true }
      },
      {
        path: 'resistance',
        name: 'Resistance',
        component: () => import('../views/analysis/Resistance.vue'),
        meta: { title: '耐药基因', requiresAuth: true }
      },
      {
        path: 'virulence',
        name: 'Virulence',
        component: () => import('../views/analysis/Virulence.vue'),
        meta: { title: '毒力基因', requiresAuth: true }
      },
      {
        path: 'phylogeny',
        name: 'Phylogeny',
        component: () => import('../views/analysis/Phylogeny.vue'),
        meta: { title: '系统发育', requiresAuth: true }
      }
    ]
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { title: '报告中心', requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '个人设置', requiresAuth: true }
  },
  {
    path: '/user-management',
    redirect: '/admin/system-settings'
  },
  {
    path: '/admin',
    name: 'Admin',
    meta: { requiresAuth: true, requiresRole: 'admin' },
    children: [
      {
        path: 'system-settings',
        name: 'SystemSettings',
        component: () => import('../views/SystemSettings.vue'),
        meta: { title: '系统设置', requiresAuth: true, requiresRole: 'admin' }
      },
      {
        path: 'experiment-settings',
        name: 'ExperimentSettings',
        component: () => import('../views/ExperimentSettings.vue'),
        meta: { title: '实验设置', requiresAuth: true, requiresRole: 'admin' }
      },
      {
        path: 'security-audit',
        name: 'SecurityAudit',
        component: () => import('../views/SecurityAudit.vue'),
        meta: { title: '安全审计', requiresAuth: true, requiresRole: 'admin' }
      }
    ]
  },
  // 兼容性重定向
  {
    path: '/system-settings',
    redirect: '/admin/system-settings'
  },
  {
    path: '/role-management',
    redirect: '/admin/system-settings'
  }
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

// 路由守卫
// 路由守卫已移至 permission.js 中统一管理
// router.beforeEach 在 main.js 中通过 createPermissionGuard 设置

export default router
