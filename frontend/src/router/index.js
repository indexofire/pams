import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '仪表板' }
  },
  {
    path: '/strains',
    name: 'Strains',
    component: () => import('../views/Strains.vue'),
    meta: { title: '菌株管理' }
  },
  {
    path: '/genomes',
    name: 'Genomes',
    component: () => import('../views/Genomes.vue'),
    meta: { title: '基因组数据' }
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: () => import('../views/Analysis.vue'),
    meta: { title: '生信分析' },
    children: [
      {
        path: 'annotation',
        name: 'Annotation',
        component: () => import('../views/analysis/Annotation.vue'),
        meta: { title: '基因组注释' }
      },
      {
        path: 'mlst',
        name: 'MLST',
        component: () => import('../views/analysis/MLST.vue'),
        meta: { title: 'MLST分型' }
      },
      {
        path: 'resistance',
        name: 'Resistance',
        component: () => import('../views/analysis/Resistance.vue'),
        meta: { title: '耐药基因' }
      },
      {
        path: 'virulence',
        name: 'Virulence',
        component: () => import('../views/analysis/Virulence.vue'),
        meta: { title: '毒力基因' }
      },
      {
        path: 'phylogeny',
        name: 'Phylogeny',
        component: () => import('../views/analysis/Phylogeny.vue'),
        meta: { title: '系统发育' }
      }
    ]
  },
  {
    path: '/reports',
    name: 'Reports',
    component: () => import('../views/Reports.vue'),
    meta: { title: '报告中心' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
    meta: { title: '系统设置' }
  }
]

const router = createRouter({
  history: process.env.IS_ELECTRON ? createWebHashHistory() : createWebHistory(),
  routes
})

export default router
