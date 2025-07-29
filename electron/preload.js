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
    updateSettings: (userId, settingsData) => ipcRenderer.invoke('users:updateSettings', userId, settingsData),
    // 权限相关
    getUserPermissions: (userId) => ipcRenderer.invoke('users:getUserPermissions', userId),
    getUserMenus: (userId) => ipcRenderer.invoke('users:getUserMenus', userId),
    getAllRoles: () => ipcRenderer.invoke('users:getAllRoles'),
    getAllPermissions: () => ipcRenderer.invoke('users:getAllPermissions'),
    hasPermission: (userId, permission) => ipcRenderer.invoke('users:hasPermission', userId, permission),
    validateOperation: (userId, operation, resource) => ipcRenderer.invoke('users:validateOperation', userId, operation, resource)
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
    deleteSampleSource: (id) => ipcRenderer.invoke('systemConfig:deleteSampleSource', id),
    getProjects: () => ipcRenderer.invoke('systemConfig:getProjects'),
    saveProject: (projectData) => ipcRenderer.invoke('systemConfig:saveProject', projectData),
    deleteProject: (id) => ipcRenderer.invoke('systemConfig:deleteProject', id),
    getExperimentTypes: () => ipcRenderer.invoke('systemConfig:getExperimentTypes'),
    saveExperimentType: (typeData) => ipcRenderer.invoke('systemConfig:saveExperimentType', typeData),
    deleteExperimentType: (id) => ipcRenderer.invoke('systemConfig:deleteExperimentType', id)
  },

  // NCBI服务
  ncbi: {
    searchTaxonomyId: (scientificName) => ipcRenderer.invoke('ncbi:searchTaxonomyId', scientificName),
    getTaxonomyDetails: (txid) => ipcRenderer.invoke('ncbi:getTaxonomyDetails', txid),
    validateTaxonomyId: (txid) => ipcRenderer.invoke('ncbi:validateTaxonomyId', txid),
    generateAbbreviation: (scientificName) => ipcRenderer.invoke('ncbi:generateAbbreviation', scientificName),
    batchSearchTaxonomyIds: (scientificNames) => ipcRenderer.invoke('ncbi:batchSearchTaxonomyIds', scientificNames)
  },

  // 生物信息学分析服务
  bioinformatics: {
    performMLSTAnalysis: (genomeFiles, options) => ipcRenderer.invoke('bioinformatics:performMLSTAnalysis', genomeFiles, options),
    performSerotypingAnalysis: (genomeFiles, options) => ipcRenderer.invoke('bioinformatics:performSerotypingAnalysis', genomeFiles, options),
    performVirulenceAnalysis: (genomeFiles, options) => ipcRenderer.invoke('bioinformatics:performVirulenceAnalysis', genomeFiles, options),
    performResistanceAnalysis: (genomeFiles, options) => ipcRenderer.invoke('bioinformatics:performResistanceAnalysis', genomeFiles, options),
    generateAnalysisReport: (results) => ipcRenderer.invoke('bioinformatics:generateAnalysisReport', results)
  },

  // 审计日志
  audit: {
    getLogs: (filters, pagination) => ipcRenderer.invoke('audit:getLogs', filters, pagination),
    getStats: (timeRange) => ipcRenderer.invoke('audit:getStats', timeRange),
    exportLogs: (filters, format) => ipcRenderer.invoke('audit:exportLogs', filters, format),
    detectAnomalies: () => ipcRenderer.invoke('audit:detectAnomalies'),
    cleanupOldLogs: (retentionDays) => ipcRenderer.invoke('audit:cleanupOldLogs', retentionDays)
  },

  // 数据库管理
  database: {
    healthCheck: () => ipcRenderer.invoke('database:healthCheck'),
    optimize: () => ipcRenderer.invoke('database:optimize'),
    getMigrationHistory: () => ipcRenderer.invoke('database:getMigrationHistory'),
    getCurrentVersion: () => ipcRenderer.invoke('database:getCurrentVersion'),
    clearAllData: () => ipcRenderer.invoke('database:clearAllData'),
    resetDatabase: () => ipcRenderer.invoke('database:resetDatabase'),
    getStats: () => ipcRenderer.invoke('database:getStats'),
    getProjectsConfig: () => ipcRenderer.invoke('database:getProjectsConfig')
  },

  // 权限管理
  permissions: {
    getRoles: () => ipcRenderer.invoke('permissions:getRoles'),
    getPermissions: () => ipcRenderer.invoke('permissions:getPermissions'),
    getRolePermissions: (roleId) => ipcRenderer.invoke('permissions:getRolePermissions', roleId),
    getUserPermissions: (userId) => ipcRenderer.invoke('permissions:getUserPermissions', userId),
    hasPermission: (userId, permissionName) => ipcRenderer.invoke('permissions:hasPermission', userId, permissionName),
    assignRoleToUser: (userId, roleId, assignedBy, expiresAt) => ipcRenderer.invoke('permissions:assignRoleToUser', userId, roleId, assignedBy, expiresAt),
    removeRoleFromUser: (userId, roleId) => ipcRenderer.invoke('permissions:removeRoleFromUser', userId, roleId),
    assignPermissionToRole: (roleId, permissionId) => ipcRenderer.invoke('permissions:assignPermissionToRole', roleId, permissionId),
    removePermissionFromRole: (roleId, permissionId) => ipcRenderer.invoke('permissions:removePermissionFromRole', roleId, permissionId)
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