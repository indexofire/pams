import { createStore } from 'vuex'
import axios from 'axios'

// 配置API基础URL
const API_BASE_URL = 'http://localhost:5000/api'

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
    // 加载状态
    loading: {
      strains: false,
      genomes: false,
      analysis: false
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
    SET_USER(state, user) {
      state.user = user
    },
    // 设置菌株数据
    SET_STRAINS(state, strains) {
      state.strains = strains
    },
    // 添加菌株
    ADD_STRAIN(state, strain) {
      state.strains.push(strain)
    },
    // 更新菌株
    UPDATE_STRAIN(state, { id, strain }) {
      const index = state.strains.findIndex(s => s.id === id)
      if (index !== -1) {
        state.strains.splice(index, 1, strain)
      }
    },
    // 删除菌株
    DELETE_STRAIN(state, id) {
      const index = state.strains.findIndex(s => s.id === id)
      if (index !== -1) {
        state.strains.splice(index, 1)
      }
    },
    // 设置基因组数据
    SET_GENOMES(state, genomes) {
      state.genomes = genomes
    },
    // 添加基因组
    ADD_GENOME(state, genome) {
      state.genomes.push(genome)
    },
    // 设置分析任务
    SET_ANALYSIS_TASKS(state, tasks) {
      state.analysisTasks = tasks
    },
    // 添加分析任务
    ADD_ANALYSIS_TASK(state, task) {
      state.analysisTasks.push(task)
    },
    // 更新任务状态
    UPDATE_TASK_STATUS(state, { id, status }) {
      const task = state.analysisTasks.find(t => t.id === id)
      if (task) {
        task.status = status
      }
    },
    // 设置加载状态
    SET_LOADING(state, { type, status }) {
      state.loading[type] = status
    },
    // 设置统计数据
    SET_STATISTICS(state, statistics) {
      state.statistics = statistics
    }
  },

  actions: {
    // 获取菌株列表
    async fetchStrains({ commit }) {
      commit('SET_LOADING', { type: 'strains', status: true })
      try {
        const response = await axios.get(`${API_BASE_URL}/strains`)
        commit('SET_STRAINS', response.data)
      } catch (error) {
        console.error('获取菌株数据失败:', error)
      } finally {
        commit('SET_LOADING', { type: 'strains', status: false })
      }
    },

    // 添加菌株
    async addStrain({ commit }, strainData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/strains`, strainData)
        commit('ADD_STRAIN', response.data)
        return response.data
      } catch (error) {
        console.error('添加菌株失败:', error)
        throw error
      }
    },

    // 更新菌株
    async updateStrain({ commit }, { id, strainData }) {
      try {
        const response = await axios.put(`${API_BASE_URL}/strains/${id}`, strainData)
        commit('UPDATE_STRAIN', { id, strain: response.data })
        return response.data
      } catch (error) {
        console.error('更新菌株失败:', error)
        throw error
      }
    },

    // 删除菌株
    async deleteStrain({ commit }, id) {
      try {
        await axios.delete(`${API_BASE_URL}/strains/${id}`)
        commit('DELETE_STRAIN', id)
      } catch (error) {
        console.error('删除菌株失败:', error)
        throw error
      }
    },

    // 获取基因组列表
    async fetchGenomes({ commit }) {
      commit('SET_LOADING', { type: 'genomes', status: true })
      try {
        const response = await axios.get(`${API_BASE_URL}/genomes`)
        commit('SET_GENOMES', response.data)
      } catch (error) {
        console.error('获取基因组数据失败:', error)
      } finally {
        commit('SET_LOADING', { type: 'genomes', status: false })
      }
    },

    // 上传基因组
    async uploadGenome({ commit }, formData) {
      try {
        const response = await axios.post(`${API_BASE_URL}/genomes/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        commit('ADD_GENOME', response.data)
        return response.data
      } catch (error) {
        console.error('上传基因组失败:', error)
        throw error
      }
    },

    // 启动分析任务
    async startAnalysis({ commit }, { type, genomeIds, params }) {
      try {
        const response = await axios.post(`${API_BASE_URL}/analysis/${type}`, {
          genome_ids: genomeIds,
          parameters: params
        })
        commit('ADD_ANALYSIS_TASK', response.data)
        return response.data
      } catch (error) {
        console.error('启动分析失败:', error)
        throw error
      }
    },

    // 获取分析任务
    async fetchAnalysisTasks({ commit }) {
      try {
        const response = await axios.get(`${API_BASE_URL}/analysis/tasks`)
        commit('SET_ANALYSIS_TASKS', response.data)
      } catch (error) {
        console.error('获取分析任务失败:', error)
      }
    },

    // 获取统计数据
    async fetchStatistics({ commit }) {
      try {
        const response = await axios.get(`${API_BASE_URL}/statistics`)
        commit('SET_STATISTICS', response.data)
      } catch (error) {
        console.error('获取统计数据失败:', error)
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
      return state.genomes.filter(genome => genome.strain_id === strainId)
    }
  }
})

export default store 