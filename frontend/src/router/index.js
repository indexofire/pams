import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import store from '../store'

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
    path: '/user-management',
    name: 'UserManagement',
    component: () => import('../views/UserManagement.vue'),
    meta: { title: '用户管理', requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/system-settings',
    name: 'SystemSettings',
    component: () => import('../views/SystemSettings.vue'),
    meta: { title: '系统设置', requiresAuth: true, requiresRole: 'admin' }
  }
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters['auth/isAuthenticated']
  const userRole = store.getters['auth/userRole']

  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录的页面，但用户未登录
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    // 已登录用户访问登录或注册页面，重定向到仪表板
    next('/dashboard')
  } else if (to.meta.requiresRole && userRole !== to.meta.requiresRole) {
    // 需要特定角色的页面，但用户角色不匹配
    next('/dashboard')
  } else {
    next()
  }
})

export default router
