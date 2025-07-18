const { contextBridge, ipcRenderer } = require('electron')

// 暴露受限制的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 文件对话框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // 用户管理
  users: {
    getAll: () => ipcRenderer.invoke('users:getAll'),
    create: (userData) => ipcRenderer.invoke('users:create', userData),
    update: (id, userData) => ipcRenderer.invoke('users:update', id, userData),
    delete: (id) => ipcRenderer.invoke('users:delete', id),
    updateProfile: (userId, profileData) => ipcRenderer.invoke('users:updateProfile', userId, profileData),
    updateSettings: (userId, settingsData) => ipcRenderer.invoke('users:updateSettings', userId, settingsData)
  },

  // 认证管理
  auth: {
    login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
    register: (userData) => ipcRenderer.invoke('auth:register', userData),
    logout: () => ipcRenderer.invoke('auth:logout'),
    changePassword: (username, currentPassword, newPassword) =>
      ipcRenderer.invoke('auth:changePassword', username, currentPassword, newPassword)
  },

  // 菌株管理
  strains: {
    getAll: () => ipcRenderer.invoke('strains:getAll'),
    create: (strainData) => ipcRenderer.invoke('strains:create', strainData),
    batchCreate: (strainsData) => ipcRenderer.invoke('strains:batchCreate', strainsData),
    update: (id, strainData) => ipcRenderer.invoke('strains:update', id, strainData),
    delete: (id) => ipcRenderer.invoke('strains:delete', id)
  },

  // 基因组管理
  genomes: {
    getAll: () => ipcRenderer.invoke('genomes:getAll'),
    upload: (filePath, metadata) => ipcRenderer.invoke('genomes:upload', filePath, metadata)
  },

  // 分析管理
  analysis: {
    start: (analysisType, genomeIds, params) => 
      ipcRenderer.invoke('analysis:start', analysisType, genomeIds, params),
    getTasks: () => ipcRenderer.invoke('analysis:getTasks')
  },

  // 统计数据
  statistics: {
    get: () => ipcRenderer.invoke('statistics:get')
  },

  // 系统配置
  systemConfig: {
    getAll: () => ipcRenderer.invoke('systemConfig:getAll'),
    getSpecies: () => ipcRenderer.invoke('systemConfig:getSpecies'),
    saveSpecies: (speciesData) => ipcRenderer.invoke('systemConfig:saveSpecies', speciesData),
    deleteSpecies: (id) => ipcRenderer.invoke('systemConfig:deleteSpecies', id),
    getRegions: () => ipcRenderer.invoke('systemConfig:getRegions'),
    saveRegion: (regionData) => ipcRenderer.invoke('systemConfig:saveRegion', regionData),
    deleteRegion: (id) => ipcRenderer.invoke('systemConfig:deleteRegion', id),
    getSampleSources: () => ipcRenderer.invoke('systemConfig:getSampleSources'),
    saveSampleSource: (sourceData) => ipcRenderer.invoke('systemConfig:saveSampleSource', sourceData),
    deleteSampleSource: (id) => ipcRenderer.invoke('systemConfig:deleteSampleSource', id)
  },

  // 事件监听
  onAppReady: (callback) => ipcRenderer.on('app-ready', callback),
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', (event, path) => callback(path)),
  onImportGenomes: (callback) => ipcRenderer.on('import-genomes', (event, filePaths) => callback(filePaths)),
  onExportData: (callback) => ipcRenderer.on('export-data', (event, filePath) => callback(filePath)),

  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})

// 为渲染进程提供有限的require访问能力（仅用于特定模块）
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('require', (moduleName) => {
    // 只允许加载特定的模块
    const allowedModules = ['xlsx']
    if (allowedModules.includes(moduleName)) {
      try {
        return require(moduleName)
      } catch (error) {
        console.error(`Failed to require ${moduleName}:`, error)
        return null
      }
    }
    throw new Error(`Module ${moduleName} is not allowed`)
  })
}