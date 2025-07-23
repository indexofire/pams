import { createStore } from 'vuex'
import permission from './modules/permission'
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
      sources: [], // 样本来源选项
      experimentTypes: [] // 实验类型选项
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
    SET_EXPERIMENT_TYPE_OPTIONS (state, experimentTypes) {
      state.systemConfig.experimentTypes = experimentTypes
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
    },
    ADD_EXPERIMENT_TYPE_OPTION (state, experimentType) {
      state.systemConfig.experimentTypes.push(experimentType)
    },
    UPDATE_EXPERIMENT_TYPE_OPTION (state, { id, experimentType }) {
      const index = state.systemConfig.experimentTypes.findIndex(item => item.id === id)
      if (index !== -1) {
        state.systemConfig.experimentTypes[index] = { ...state.systemConfig.experimentTypes[index], ...experimentType }
      }
    },
    DELETE_EXPERIMENT_TYPE_OPTION (state, id) {
      state.systemConfig.experimentTypes = state.systemConfig.experimentTypes.filter(item => item.id !== id)
    }
  },

  actions: {
    // 加载系统配置
    async loadSystemConfig ({ commit }) {
      try {
        if (electronAPI && electronAPI.systemConfig) {
          const species = await electronAPI.systemConfig.getSpecies()
          const regions = await electronAPI.systemConfig.getRegions()
          const sources = await electronAPI.systemConfig.getSampleSources()
          const experimentTypes = await electronAPI.systemConfig.getExperimentTypes()

          // 转换数据格式以适配前端需求
          const formattedSpecies = species.map(item => ({
            id: item.id,
            value: item.name, // 使用菌种名称而不是学名
            label: item.name,
            scientific_name: item.scientific_name, // 保留学名字段
            description: item.description,
            status: item.status,
            abbreviation: item.abbreviation,
            ncbi_txid: item.ncbi_txid
          }))

          const formattedRegions = regions.map(item => ({
            id: item.id,
            value: item.name,
            label: item.name,
            description: item.description,
            status: item.status
          }))

          const formattedSources = sources.map(item => ({
            id: item.id,
            value: item.name,
            label: item.name,
            description: item.description,
            status: item.status
          }))

          const formattedExperimentTypes = experimentTypes.map(item => ({
            id: item.id,
            value: item.name,
            label: item.name,
            code: item.code,
            category: item.category,
            description: item.description,
            status: item.status
          }))

          commit('SET_SPECIES_OPTIONS', formattedSpecies)
          commit('SET_REGION_OPTIONS', formattedRegions)
          commit('SET_SOURCE_OPTIONS', formattedSources)
          commit('SET_EXPERIMENT_TYPE_OPTIONS', formattedExperimentTypes)
        } else {
          // 开发环境：从localStorage加载或使用默认模拟数据
          const savedSpecies = localStorage.getItem('pams_species')
          const savedRegions = localStorage.getItem('pams_regions')
          const savedSources = localStorage.getItem('pams_sources')
          const savedExperimentTypes = localStorage.getItem('pams_experiment_types')

          // 默认空数据 - 对应实验设置中的相关字段
          const defaultSpecies = []
          const defaultRegions = []
          const defaultSources = []

          // 处理菌种数据
          const species = savedSpecies ? JSON.parse(savedSpecies) : defaultSpecies
          const formattedSpecies = species.map(item => ({
            id: item.id,
            value: item.name, // 使用菌种名称而不是学名
            label: item.name,
            scientific_name: item.scientific_name,
            description: item.description,
            status: item.status,
            abbreviation: item.abbreviation,
            ncbi_txid: item.ncbi_txid
          }))
          commit('SET_SPECIES_OPTIONS', formattedSpecies)

          // 处理地区数据
          const regions = savedRegions ? JSON.parse(savedRegions) : defaultRegions
          const formattedRegions = regions.map(item => ({
            id: item.id,
            value: item.name,
            label: item.name,
            description: item.description,
            status: item.status
          }))
          commit('SET_REGION_OPTIONS', formattedRegions)

          // 处理样本来源数据
          const sources = savedSources ? JSON.parse(savedSources) : defaultSources
          const formattedSources = sources.map(item => ({
            id: item.id,
            value: item.name,
            label: item.name,
            description: item.description,
            status: item.status
          }))
          commit('SET_SOURCE_OPTIONS', formattedSources)

          // 处理实验类型数据（如果有的话）
          if (savedExperimentTypes) {
            const experimentTypes = JSON.parse(savedExperimentTypes)
            const formattedExperimentTypes = experimentTypes.map(item => ({
              id: item.id,
              value: item.name,
              label: item.name,
              code: item.code,
              category: item.category,
              description: item.description,
              status: item.status
            }))
            commit('SET_EXPERIMENT_TYPE_OPTIONS', formattedExperimentTypes)
          }
        }
      } catch (error) {
        console.error('加载系统配置失败:', error)
      }
    },

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

          // 生成基于实际菌株数据的菌种分布数据
          const speciesDistribution = []
          if (totalStrains > 0) {
            // 基于实际菌株数据计算分布
            const speciesCount = {}
            state.strains.forEach(strain => {
              const species = strain.species || '未知'
              speciesCount[species] = (speciesCount[species] || 0) + 1
            })

            Object.entries(speciesCount).forEach(([name, value]) => {
              speciesDistribution.push({ name, value })
            })
          }

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

          // 转换数据格式以适配前端
          const formattedConfig = {
            species: config.species.map(item => ({
              id: item.id,
              value: item.name,
              label: item.name,
              scientific_name: item.scientific_name,
              description: item.description,
              status: item.status
            })),
            regions: config.regions.map(item => ({
              id: item.id,
              value: item.name,
              label: item.name,
              code: item.code,
              level: item.level,
              status: item.status
            })),
            sources: config.sampleSources.map(item => ({
              id: item.id,
              value: item.name,
              label: item.name,
              category: item.category,
              description: item.description,
              status: item.status
            }))
          }

          commit('SET_SYSTEM_CONFIG', formattedConfig)
        } else {
          // 开发环境空数据 - 对应实验设置中的相关字段
          const mockConfig = {
            species: [],
            regions: [],
            sources: [],
            experimentTypes: []
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
    },

    async saveExperimentTypeOption ({ commit }, experimentTypeData) {
      try {
        if (electronAPI && electronAPI.systemConfig) {
          const result = await electronAPI.systemConfig.saveExperimentType(experimentTypeData)
          if (experimentTypeData.id) {
            commit('UPDATE_EXPERIMENT_TYPE_OPTION', { id: experimentTypeData.id, experimentType: result })
          } else {
            commit('ADD_EXPERIMENT_TYPE_OPTION', result)
          }
          return result
        } else {
          // 开发环境模拟
          const experimentType = {
            id: experimentTypeData.id || Date.now(),
            ...experimentTypeData,
            status: experimentTypeData.status || 'active'
          }
          if (experimentTypeData.id) {
            commit('UPDATE_EXPERIMENT_TYPE_OPTION', { id: experimentTypeData.id, experimentType })
          } else {
            commit('ADD_EXPERIMENT_TYPE_OPTION', experimentType)
          }
          return experimentType
        }
      } catch (error) {
        console.error('保存实验类型选项失败:', error)
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
    },

    activeExperimentTypeOptions: (state) => {
      return state.systemConfig.experimentTypes
        .filter(item => item.status === 'active')
        .map(item => ({
          value: item.value,
          label: item.label,
          description: item.description
        }))
    }
  },

  modules: {
    auth,
    permission
  }
})

// 应用启动时检查认证状态
store.dispatch('auth/checkAuth')

export default store
