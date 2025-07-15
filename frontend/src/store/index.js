import { createStore } from 'vuex'
import auth from './modules/auth'

// 使用Electron API
const electronAPI = window.electronAPI

const store = createStore({
  state: {
    // 用户信息
    user: {
      id: null,
      username: '',
      role: ''
    },
    // 菌株数据
    strains: [],
    // 基因组数据
    genomes: [],
    // 分析任务
    analysisTasks: [],
    // 系统配置数据
    systemConfig: {
      species: [], // 菌种选项
      regions: [], // 地区选项
      sources: [] // 样本来源选项
    },
    // 加载状态
    loading: {
      strains: false,
      genomes: false,
      analysis: false,
      systemConfig: false
    },
    // 统计数据
    statistics: {
      totalStrains: 0,
      totalGenomes: 0,
      completedAnalysis: 0,
      pendingTasks: 0
    }
  },

  mutations: {
    // 设置用户信息
    SET_USER (state, user) {
      state.user = user
    },
    // 设置菌株数据
    SET_STRAINS (state, strains) {
      state.strains = strains
    },
    // 添加菌株
    ADD_STRAIN (state, strain) {
      state.strains.push(strain)
    },
    // 更新菌株
    UPDATE_STRAIN (state, { id, strain }) {
      const index = state.strains.findIndex(s => s.id === id)
      if (index !== -1) {
        state.strains.splice(index, 1, strain)
      }
    },
    // 删除菌株
    DELETE_STRAIN (state, id) {
      const index = state.strains.findIndex(s => s.id === id)
      if (index !== -1) {
        state.strains.splice(index, 1)
      }
    },
    // 设置基因组数据
    SET_GENOMES (state, genomes) {
      state.genomes = genomes
    },
    // 添加基因组
    ADD_GENOME (state, genome) {
      state.genomes.push(genome)
    },
    // 设置分析任务
    SET_ANALYSIS_TASKS (state, tasks) {
      state.analysisTasks = tasks
    },
    // 添加分析任务
    ADD_ANALYSIS_TASK (state, task) {
      state.analysisTasks.push(task)
    },
    // 更新任务状态
    UPDATE_TASK_STATUS (state, { id, status }) {
      const task = state.analysisTasks.find(t => t.id === id)
      if (task) {
        task.status = status
      }
    },
    // 设置加载状态
    SET_LOADING (state, { type, status }) {
      state.loading[type] = status
    },
    // 设置统计数据
    SET_STATISTICS (state, statistics) {
      state.statistics = statistics
    },

    // 系统配置相关mutations
    SET_SYSTEM_CONFIG (state, config) {
      state.systemConfig = { ...state.systemConfig, ...config }
    },
    SET_SPECIES_OPTIONS (state, species) {
      state.systemConfig.species = species
    },
    SET_REGION_OPTIONS (state, regions) {
      state.systemConfig.regions = regions
    },
    SET_SOURCE_OPTIONS (state, sources) {
      state.systemConfig.sources = sources
    },
    ADD_SPECIES_OPTION (state, species) {
      state.systemConfig.species.push(species)
    },
    UPDATE_SPECIES_OPTION (state, { id, species }) {
      const index = state.systemConfig.species.findIndex(item => item.id === id)
      if (index !== -1) {
        state.systemConfig.species[index] = { ...state.systemConfig.species[index], ...species }
      }
    },
    DELETE_SPECIES_OPTION (state, id) {
      state.systemConfig.species = state.systemConfig.species.filter(item => item.id !== id)
    },
    ADD_REGION_OPTION (state, region) {
      state.systemConfig.regions.push(region)
    },
    UPDATE_REGION_OPTION (state, { id, region }) {
      const index = state.systemConfig.regions.findIndex(item => item.id === id)
      if (index !== -1) {
        state.systemConfig.regions[index] = { ...state.systemConfig.regions[index], ...region }
      }
    },
    DELETE_REGION_OPTION (state, id) {
      state.systemConfig.regions = state.systemConfig.regions.filter(item => item.id !== id)
    },
    ADD_SOURCE_OPTION (state, source) {
      state.systemConfig.sources.push(source)
    },
    UPDATE_SOURCE_OPTION (state, { id, source }) {
      const index = state.systemConfig.sources.findIndex(item => item.id === id)
      if (index !== -1) {
        state.systemConfig.sources[index] = { ...state.systemConfig.sources[index], ...source }
      }
    },
    DELETE_SOURCE_OPTION (state, id) {
      state.systemConfig.sources = state.systemConfig.sources.filter(item => item.id !== id)
    }
  },

  actions: {
    // 获取菌株列表
    async fetchStrains ({ commit }) {
      if (!electronAPI) return

      commit('SET_LOADING', { type: 'strains', status: true })
      try {
        const strains = await electronAPI.strains.getAll()
        commit('SET_STRAINS', strains)
      } catch (error) {
        console.error('获取菌株数据失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', { type: 'strains', status: false })
      }
    },

    // 添加菌株
    async addStrain ({ commit }, strainData) {
      if (!electronAPI) return

      try {
        const strain = await electronAPI.strains.create(strainData)
        commit('ADD_STRAIN', strain)
        return strain
      } catch (error) {
        console.error('添加菌株失败:', error)
        throw error
      }
    },

    // 更新菌株
    async updateStrain ({ commit }, { id, strainData }) {
      if (!electronAPI) return

      try {
        const strain = await electronAPI.strains.update(id, strainData)
        commit('UPDATE_STRAIN', { id, strain })
        return strain
      } catch (error) {
        console.error('更新菌株失败:', error)
        throw error
      }
    },

    // 删除菌株
    async deleteStrain ({ commit }, id) {
      if (!electronAPI) return

      try {
        await electronAPI.strains.delete(id)
        commit('DELETE_STRAIN', id)
      } catch (error) {
        console.error('删除菌株失败:', error)
        throw error
      }
    },

    // 获取基因组列表
    async fetchGenomes ({ commit }) {
      if (!electronAPI) return

      commit('SET_LOADING', { type: 'genomes', status: true })
      try {
        const genomes = await electronAPI.genomes.getAll()
        commit('SET_GENOMES', genomes)
      } catch (error) {
        console.error('获取基因组数据失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', { type: 'genomes', status: false })
      }
    },

    // 上传基因组
    async uploadGenome ({ commit }, { filePath, metadata }) {
      if (!electronAPI) return

      try {
        const genome = await electronAPI.genomes.upload(filePath, metadata)
        commit('ADD_GENOME', genome)
        return genome
      } catch (error) {
        console.error('上传基因组失败:', error)
        throw error
      }
    },

    // 启动分析任务
    async startAnalysis ({ commit }, { type, genomeIds, params }) {
      if (!electronAPI) return

      try {
        const task = await electronAPI.analysis.start(type, genomeIds, params)
        commit('ADD_ANALYSIS_TASK', task)
        return task
      } catch (error) {
        console.error('启动分析失败:', error)
        throw error
      }
    },

    // 获取分析任务
    async fetchAnalysisTasks ({ commit }) {
      if (!electronAPI) return

      try {
        const tasks = await electronAPI.analysis.getTasks()
        commit('SET_ANALYSIS_TASKS', tasks)
      } catch (error) {
        console.error('获取分析任务失败:', error)
        throw error
      }
    },

    // 获取统计数据
    async fetchStatistics ({ commit, state }) {
      try {
        let statistics

        if (electronAPI && electronAPI.statistics) {
          // 使用Electron API获取统计数据
          statistics = await electronAPI.statistics.get()
        } else {
          // 开发环境或Web环境，基于现有数据计算统计
          const totalStrains = state.strains.length
          const totalGenomes = state.genomes.length
          const completedAnalysis = state.analysisTasks.filter(task => task.status === 'completed').length
          const pendingTasks = state.analysisTasks.filter(task => task.status === 'pending' || task.status === 'running').length

          // 生成模拟的月度趋势数据
          const monthlyData = []
          const currentDate = new Date()
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
            const monthName = `${date.getMonth() + 1}月`
            monthlyData.push({
              month: monthName,
              strains: Math.floor(Math.random() * 30) + 10,
              genomes: Math.floor(Math.random() * 25) + 8,
              analysis: Math.floor(Math.random() * 20) + 5
            })
          }

          // 生成模拟的菌种分布数据
          const speciesDistribution = [
            { name: '大肠杆菌', value: Math.floor(totalStrains * 0.35) || 35 },
            { name: '沙门氏菌', value: Math.floor(totalStrains * 0.25) || 25 },
            { name: '志贺氏菌', value: Math.floor(totalStrains * 0.20) || 20 },
            { name: '弧菌', value: Math.floor(totalStrains * 0.15) || 15 },
            { name: '其他', value: Math.floor(totalStrains * 0.05) || 5 }
          ]

          // 生成最近活动数据
          const recentActivities = [
            {
              id: 1,
              description: `新增菌株记录：${totalStrains > 0 ? 'E.coli-' + String(totalStrains).padStart(3, '0') : 'E.coli-001'}`,
              time: new Date(Date.now() - Math.random() * 86400000).toLocaleString(),
              type: 'success'
            },
            {
              id: 2,
              description: '完成了沙门氏菌MLST分型分析',
              time: new Date(Date.now() - Math.random() * 172800000).toLocaleString(),
              type: 'primary'
            },
            {
              id: 3,
              description: '用户上传了基因组文件',
              time: new Date(Date.now() - Math.random() * 259200000).toLocaleString(),
              type: 'info'
            },
            {
              id: 4,
              description: '耐药基因检测任务已完成',
              time: new Date(Date.now() - Math.random() * 345600000).toLocaleString(),
              type: 'success'
            }
          ]

          statistics = {
            totalStrains,
            totalGenomes,
            completedAnalysis,
            pendingTasks,
            monthlyData,
            speciesDistribution,
            recentActivities
          }
        }

        commit('SET_STATISTICS', statistics)
        return statistics
      } catch (error) {
        console.error('获取统计数据失败:', error)
        throw error
      }
    },

    // 系统配置相关actions
    async fetchSystemConfig ({ commit }) {
      commit('SET_LOADING', { type: 'systemConfig', status: true })

      try {
        if (electronAPI && electronAPI.systemConfig) {
          // 使用Electron API获取系统配置
          const config = await electronAPI.systemConfig.getAll()
          commit('SET_SYSTEM_CONFIG', config)
        } else {
          // 开发环境模拟数据
          const mockConfig = {
            species: [
              { id: 1, value: 'E.coli', label: '大肠杆菌', description: '常见病原菌', status: 'active' },
              { id: 2, value: 'Salmonella', label: '沙门氏菌', description: '肠道病原菌', status: 'active' },
              { id: 3, value: 'Shigella', label: '志贺氏菌', description: '痢疾病原菌', status: 'active' },
              { id: 4, value: 'Vibrio', label: '弧菌', description: '水生细菌', status: 'active' },
              { id: 5, value: 'S.aureus', label: '金黄色葡萄球菌', description: '常见致病菌', status: 'active' }
            ],
            regions: [
              { id: 1, value: 'beijing', label: '北京市', description: '直辖市', status: 'active' },
              { id: 2, value: 'shanghai', label: '上海市', description: '直辖市', status: 'active' },
              { id: 3, value: 'guangdong', label: '广东省', description: '省份', status: 'active' },
              { id: 4, value: 'jiangsu', label: '江苏省', description: '省份', status: 'active' },
              { id: 5, value: 'zhejiang', label: '浙江省', description: '省份', status: 'active' },
              { id: 6, value: 'shandong', label: '山东省', description: '省份', status: 'active' }
            ],
            sources: [
              { id: 1, value: 'blood', label: '血液', description: '临床血液样本', status: 'active' },
              { id: 2, value: 'feces', label: '粪便', description: '临床粪便样本', status: 'active' },
              { id: 3, value: 'urine', label: '尿液', description: '临床尿液样本', status: 'active' },
              { id: 4, value: 'food', label: '食品', description: '食品样本', status: 'active' },
              { id: 5, value: 'water', label: '水源', description: '环境水样', status: 'active' },
              { id: 6, value: 'soil', label: '土壤', description: '环境土样', status: 'active' }
            ]
          }
          commit('SET_SYSTEM_CONFIG', mockConfig)
        }
      } catch (error) {
        console.error('获取系统配置失败:', error)
        throw error
      } finally {
        commit('SET_LOADING', { type: 'systemConfig', status: false })
      }
    },

    async saveSpeciesOption ({ commit }, speciesData) {
      try {
        if (electronAPI && electronAPI.systemConfig) {
          const result = await electronAPI.systemConfig.saveSpecies(speciesData)
          if (speciesData.id) {
            commit('UPDATE_SPECIES_OPTION', { id: speciesData.id, species: result })
          } else {
            commit('ADD_SPECIES_OPTION', result)
          }
          return result
        } else {
          // 开发环境模拟
          const species = {
            id: speciesData.id || Date.now(),
            ...speciesData,
            status: speciesData.status || 'active'
          }
          if (speciesData.id) {
            commit('UPDATE_SPECIES_OPTION', { id: speciesData.id, species })
          } else {
            commit('ADD_SPECIES_OPTION', species)
          }
          return species
        }
      } catch (error) {
        console.error('保存菌种选项失败:', error)
        throw error
      }
    },

    async saveRegionOption ({ commit }, regionData) {
      try {
        if (electronAPI && electronAPI.systemConfig) {
          const result = await electronAPI.systemConfig.saveRegion(regionData)
          if (regionData.id) {
            commit('UPDATE_REGION_OPTION', { id: regionData.id, region: result })
          } else {
            commit('ADD_REGION_OPTION', result)
          }
          return result
        } else {
          // 开发环境模拟
          const region = {
            id: regionData.id || Date.now(),
            ...regionData,
            status: regionData.status || 'active'
          }
          if (regionData.id) {
            commit('UPDATE_REGION_OPTION', { id: regionData.id, region })
          } else {
            commit('ADD_REGION_OPTION', region)
          }
          return region
        }
      } catch (error) {
        console.error('保存地区选项失败:', error)
        throw error
      }
    },

    async saveSourceOption ({ commit }, sourceData) {
      try {
        if (electronAPI && electronAPI.systemConfig) {
          const result = await electronAPI.systemConfig.saveSource(sourceData)
          if (sourceData.id) {
            commit('UPDATE_SOURCE_OPTION', { id: sourceData.id, source: result })
          } else {
            commit('ADD_SOURCE_OPTION', result)
          }
          return result
        } else {
          // 开发环境模拟
          const source = {
            id: sourceData.id || Date.now(),
            ...sourceData,
            status: sourceData.status || 'active'
          }
          if (sourceData.id) {
            commit('UPDATE_SOURCE_OPTION', { id: sourceData.id, source })
          } else {
            commit('ADD_SOURCE_OPTION', source)
          }
          return source
        }
      } catch (error) {
        console.error('保存样本来源选项失败:', error)
        throw error
      }
    }
  },

  getters: {
    // 获取特定状态的任务
    getTasksByStatus: (state) => (status) => {
      return state.analysisTasks.filter(task => task.status === status)
    },
    // 获取特定菌株的基因组
    getGenomesByStrain: (state) => (strainId) => {
      return state.genomes.filter(genome => genome.strainId === strainId)
    },

    // 系统配置相关getters
    activeSpeciesOptions: (state) => {
      return state.systemConfig.species
        .filter(item => item.status === 'active')
        .map(item => ({
          value: item.value,
          label: item.label,
          description: item.description
        }))
    },

    activeRegionOptions: (state) => {
      return state.systemConfig.regions
        .filter(item => item.status === 'active')
        .map(item => ({
          value: item.value,
          label: item.label,
          description: item.description
        }))
    },

    activeSourceOptions: (state) => {
      return state.systemConfig.sources
        .filter(item => item.status === 'active')
        .map(item => ({
          value: item.value,
          label: item.label,
          description: item.description
        }))
    }
  },

  modules: {
    auth
  }
})

// 应用启动时检查认证状态
store.dispatch('auth/checkAuth')

export default store
