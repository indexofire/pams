const { contextBridge, ipcRenderer } = require('electron')

// 暴露受限制的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // 文件对话框
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),

  // 菌株管理
  strains: {
    getAll: () => ipcRenderer.invoke('strains:getAll'),
    create: (strainData) => ipcRenderer.invoke('strains:create', strainData),
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

  // 事件监听
  onAppReady: (callback) => ipcRenderer.on('app-ready', callback),
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', (event, path) => callback(path)),
  onImportGenomes: (callback) => ipcRenderer.on('import-genomes', (event, filePaths) => callback(filePaths)),
  onExportData: (callback) => ipcRenderer.on('export-data', (event, filePath) => callback(filePath)),

  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}) 