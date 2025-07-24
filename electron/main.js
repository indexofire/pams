const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged
//const electronReload =require('electron-reload')
//electronReload(__dirname, {electron:require('electron')})

// 导入后端服务
const DatabaseService = require('../src/services/DatabaseService')
const StrainService = require('../src/services/StrainService')
const GenomeService = require('../src/services/GenomeService')
const AnalysisService = require('../src/services/AnalysisService')
const UserService = require('../src/services/UserService')
const SystemConfigService = require('../src/services/SystemConfigService')
const AuditService = require('../src/services/AuditService')
const NCBIService = require('../src/services/NCBIService')
const BioinformaticsService = require('../src/services/BioinformaticsService')

let mainWindow
let dbService
let auditService

async function createWindow() {
  // 初始化数据库
  try {
    dbService = new DatabaseService()
    await dbService.initialize()
    console.log('数据库初始化成功')

    // 初始化审计服务
    auditService = new AuditService(dbService)
    console.log('审计服务初始化成功')
  } catch (error) {
    console.error('数据库初始化失败:', error)
  }

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../frontend/public/favicon.ico'),
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  })

  // 加载应用
  if (isDev) {
    // 开发模式：等待前端服务启动后再加载
    setTimeout(() => {
      // 从环境变量获取端口，默认8080
      const devPort = process.env.DEV_PORT || '8080'
      mainWindow.loadURL(`http://localhost:${devPort}`)
      mainWindow.webContents.openDevTools()
    }, 3000) // 给前端服务3秒启动时间
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 发送就绪状态
    mainWindow.webContents.send('app-ready')
  })

  // 窗口关闭处理
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 设置菜单
  setApplicationMenu()
  
  // 注册IPC处理器
  registerIpcHandlers()
}

function setApplicationMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '导入基因组',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            handleImportGenome()
          }
        },
        {
          label: '导出数据',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            handleExportData()
          }
        },
        { type: 'separator' },
        {
          label: '设置',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/settings')
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '分析',
      submenu: [
        {
          label: '基因组注释',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/analysis/annotation')
          }
        },
        {
          label: 'MLST分型',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/analysis/mlst')
          }
        },
        {
          label: '耐药基因检测',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/analysis/resistance')
          }
        },
        {
          label: '系统发育分析',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/analysis/phylogeny')
          }
        }
      ]
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于PAMS',
          click: () => {
            showAboutDialog()
          }
        },
        {
          label: '用户手册',
          click: () => {
            shell.openExternal('https://github.com/indexofire/pams/wiki')
          }
        }
      ]
    }
  ]

  // macOS特殊处理
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function registerIpcHandlers() {
  // 应用信息
  ipcMain.handle('get-app-version', () => {
    return app.getVersion()
  })

  // 文件对话框
  ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options)
    return result
  })

  ipcMain.handle('show-open-dialog', async (event, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options)
    return result
  })

  // 用户相关
  ipcMain.handle('users:getAll', async () => {
    const userService = new UserService(dbService)
    return await userService.getAllUsers()
  })

  ipcMain.handle('users:create', async (event, userData) => {
    const userService = new UserService(dbService)
    return await userService.createUser(userData)
  })

  ipcMain.handle('users:update', async (event, id, userData) => {
    const userService = new UserService(dbService)
    return await userService.updateUser(id, userData)
  })

  ipcMain.handle('users:delete', async (event, id) => {
    const userService = new UserService(dbService)
    return await userService.deleteUser(id)
  })

  // 认证相关
  ipcMain.handle('auth:login', async (event, username, password) => {
    try {
      console.log('收到登录请求:', { username, password: password ? '***' : 'undefined' })
      const userService = new UserService(dbService)
      const result = await userService.login(username, password)

      // 记录登录审计日志
      if (auditService) {
        await auditService.logLogin(
          username,
          result.id,
          'success',
          '127.0.0.1', // Electron环境下的本地IP
          'Electron App',
          `session_${Date.now()}`,
          { loginMethod: 'password' }
        )
      }

      return result
    } catch (error) {
      console.error('登录处理失败:', error)

      // 记录登录失败审计日志
      if (auditService) {
        await auditService.logLogin(
          username,
          null,
          'failure',
          '127.0.0.1',
          'Electron App',
          null,
          { error: error.message }
        )
      }

      throw error
    }
  })

  ipcMain.handle('auth:register', async (event, userData) => {
    const userService = new UserService(dbService)
    return await userService.register(userData)
  })

  ipcMain.handle('auth:logout', async () => {
    // 清理会话数据等
    return true
  })

  ipcMain.handle('auth:changePassword', async (event, username, currentPassword, newPassword) => {
    const userService = new UserService(dbService)
    return await userService.changePassword(username, currentPassword, newPassword)
  })

  // 用户资料相关
  ipcMain.handle('users:updateProfile', async (event, userId, profileData) => {
    const userService = new UserService(dbService)
    return await userService.updateUserProfile(userId, profileData)
  })

  ipcMain.handle('users:updateSettings', async (event, userId, settingsData) => {
    const userService = new UserService(dbService)
    return await userService.updateUserSettings(userId, settingsData)
  })

  // 权限相关
  ipcMain.handle('users:getUserPermissions', async (event, userId) => {
    const userService = new UserService(dbService)
    const user = await userService.getUserById(userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    return userService.permissionService.getRolePermissions(user.role)
  })

  ipcMain.handle('users:getUserMenus', async (event, userId) => {
    const userService = new UserService(dbService)
    return await userService.getUserMenus(userId)
  })

  ipcMain.handle('users:getAllRoles', async () => {
    const userService = new UserService(dbService)
    return userService.getAllRoles()
  })

  ipcMain.handle('users:getAllPermissions', async () => {
    const userService = new UserService(dbService)
    return userService.getAllPermissions()
  })

  ipcMain.handle('users:hasPermission', async (event, userId, permission) => {
    const userService = new UserService(dbService)
    return userService.hasPermission(userId, permission)
  })

  ipcMain.handle('users:validateOperation', async (event, userId, operation, resource) => {
    const userService = new UserService(dbService)
    return userService.validateOperation(userId, operation, resource)
  })

  // 审计相关
  ipcMain.handle('audit:getLogs', async (event, filters, pagination) => {
    return auditService.getAuditLogs(filters, pagination)
  })

  ipcMain.handle('audit:getStats', async (event, timeRange) => {
    return auditService.getAuditStats(timeRange)
  })

  ipcMain.handle('audit:exportLogs', async (event, filters, format) => {
    return auditService.exportAuditLogs(filters, format)
  })

  ipcMain.handle('audit:detectAnomalies', async () => {
    return auditService.detectAnomalies()
  })

  ipcMain.handle('audit:cleanupOldLogs', async (event, retentionDays) => {
    return auditService.cleanupOldLogs(retentionDays)
  })

  // 数据库管理相关
  ipcMain.handle('database:healthCheck', async () => {
    if (dbService.migrationService) {
      return await dbService.migrationService.healthCheck()
    }
    return { status: 'error', error: '迁移服务未初始化' }
  })

  ipcMain.handle('database:optimize', async () => {
    if (dbService.migrationService) {
      return await dbService.migrationService.optimizeDatabase()
    }
    return { status: 'error', error: '迁移服务未初始化' }
  })

  ipcMain.handle('database:getMigrationHistory', async () => {
    if (dbService.migrationService) {
      return dbService.migrationService.getMigrationHistory()
    }
    return []
  })

  ipcMain.handle('database:getCurrentVersion', async () => {
    if (dbService.migrationService) {
      return dbService.migrationService.getCurrentVersion()
    }
    return '0.0.0'
  })

  ipcMain.handle('database:clearAllData', async () => {
    try {
      return await dbService.clearAllData()
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('database:resetDatabase', async () => {
    try {
      return await dbService.resetDatabase()
    } catch (error) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle('database:getStats', async () => {
    try {
      return dbService.getDatabaseStats()
    } catch (error) {
      return {}
    }
  })

  // 权限管理相关
  ipcMain.handle('permissions:getRoles', async () => {
    if (dbService.permissionService) {
      return dbService.permissionService.getRoles()
    }
    return []
  })

  ipcMain.handle('permissions:getPermissions', async () => {
    if (dbService.permissionService) {
      return dbService.permissionService.getPermissions()
    }
    return []
  })

  ipcMain.handle('permissions:getRolePermissions', async (event, roleId) => {
    if (dbService.permissionService) {
      return dbService.permissionService.getRolePermissions(roleId)
    }
    return []
  })

  ipcMain.handle('permissions:getUserPermissions', async (event, userId) => {
    if (dbService.permissionService) {
      return dbService.permissionService.getUserPermissions(userId)
    }
    return []
  })

  ipcMain.handle('permissions:hasPermission', async (event, userId, permissionName) => {
    if (dbService.permissionService) {
      return dbService.permissionService.hasPermission(userId, permissionName)
    }
    return false
  })

  ipcMain.handle('permissions:assignRoleToUser', async (event, userId, roleId, assignedBy, expiresAt) => {
    if (dbService.permissionService) {
      return dbService.permissionService.assignRoleToUser(userId, roleId, assignedBy, expiresAt)
    }
    return false
  })

  ipcMain.handle('permissions:removeRoleFromUser', async (event, userId, roleId) => {
    if (dbService.permissionService) {
      return dbService.permissionService.removeRoleFromUser(userId, roleId)
    }
    return false
  })

  ipcMain.handle('permissions:assignPermissionToRole', async (event, roleId, permissionId) => {
    if (dbService.permissionService) {
      return dbService.permissionService.assignPermissionToRole(roleId, permissionId)
    }
    return false
  })

  ipcMain.handle('permissions:removePermissionFromRole', async (event, roleId, permissionId) => {
    if (dbService.permissionService) {
      return dbService.permissionService.removePermissionFromRole(roleId, permissionId)
    }
    return false
  })

  // 菌株相关
  ipcMain.handle('strains:getAll', async () => {
    const strainService = new StrainService(dbService)
    return await strainService.getAllStrains()
  })

  ipcMain.handle('strains:create', async (event, strainData) => {
    // 确保日期字段为正确的字符串格式
    const processedData = { ...strainData }

    // 移除原有的id字段，让数据库自动分配唯一ID
    delete processedData.id

    // 处理可能的日期字段
    const dateFields = ['onset_date', 'sampling_date', 'isolation_date']
    dateFields.forEach(field => {
      if (processedData[field]) {
        // 如果是 Date 对象，转换为 YYYY-MM-DD 格式
        if (processedData[field] instanceof Date) {
          processedData[field] = processedData[field].toISOString().split('T')[0]
        }
        // 如果是日期字符串，尝试解析并标准化格式
        else if (typeof processedData[field] === 'string') {
          const date = new Date(processedData[field])
          if (!isNaN(date.getTime())) {
            processedData[field] = date.toISOString().split('T')[0]
          }
        }
      }
    })

    const strainService = new StrainService(dbService)
    return await strainService.createStrain(processedData)
  })

  ipcMain.handle('strains:batchCreate', async (event, strainsData) => {
    const strainService = new StrainService(dbService)

    try {
      // 处理每个菌株数据的日期字段
      const processedStrains = strainsData.map(strainData => {
        const processedData = { ...strainData }

        // 移除原有的id字段，让数据库自动分配唯一ID
        delete processedData.id

        // 处理可能的日期字段
        const dateFields = ['onset_date', 'sampling_date', 'isolation_date']
        dateFields.forEach(field => {
          if (processedData[field]) {
            // 如果是Date对象，转换为ISO字符串
            if (processedData[field] instanceof Date) {
              processedData[field] = processedData[field].toISOString().split('T')[0]
            }
            // 如果是字符串，确保格式正确
            else if (typeof processedData[field] === 'string') {
              const date = new Date(processedData[field])
              if (!isNaN(date.getTime())) {
                processedData[field] = date.toISOString().split('T')[0]
              }
            }
          }
        })

        return processedData
      })

      return await strainService.batchCreateStrains(processedStrains)
    } catch (error) {
      console.error('批量创建菌株失败:', error)
      throw error
    }
  })

  ipcMain.handle('strains:update', async (event, id, strainData) => {
    // 确保日期字段为正确的字符串格式
    const processedData = { ...strainData }
    
    // 处理可能的日期字段
    const dateFields = ['onset_date', 'sampling_date', 'isolation_date']
    dateFields.forEach(field => {
      if (processedData[field]) {
        // 如果是 Date 对象，转换为 YYYY-MM-DD 格式
        if (processedData[field] instanceof Date) {
          processedData[field] = processedData[field].toISOString().split('T')[0]
        } 
        // 如果是日期字符串，尝试解析并标准化格式
        else if (typeof processedData[field] === 'string') {
          const date = new Date(processedData[field])
          if (!isNaN(date.getTime())) {
            processedData[field] = date.toISOString().split('T')[0]
          }
        }
      }
    })
    
    const strainService = new StrainService(dbService)
    return await strainService.updateStrain(id, processedData)
  })

  ipcMain.handle('strains:delete', async (event, id) => {
    const strainService = new StrainService(dbService)
    return await strainService.deleteStrain(id)
  })

  // 基因组相关
  ipcMain.handle('genomes:getAll', async () => {
    const genomeService = new GenomeService(dbService)
    return await genomeService.getAllGenomes()
  })

  ipcMain.handle('genomes:upload', async (event, filePath, metadata) => {
    const genomeService = new GenomeService(dbService)
    return await genomeService.uploadGenome(filePath, metadata)
  })

  // 分析相关
  ipcMain.handle('analysis:start', async (event, analysisType, genomeIds, params) => {
    const analysisService = new AnalysisService(dbService)
    return await analysisService.startAnalysis(analysisType, genomeIds, params)
  })

  ipcMain.handle('analysis:getTasks', async () => {
    const analysisService = new AnalysisService(dbService)
    return await analysisService.getAllTasks()
  })

  // 统计数据
  ipcMain.handle('statistics:get', async () => {
    const strainService = new StrainService(dbService)
    const genomeService = new GenomeService(dbService)
    const analysisService = new AnalysisService(dbService)

    try {
      const [strainStats, genomeStats, taskStats] = await Promise.all([
        strainService.getStrainStats(),
        genomeService.getGenomeStats(),
        analysisService.getTaskStats()
      ])

      // 获取菌种分布数据
      const speciesDistribution = Object.entries(strainStats.bySpecies || {}).map(([name, value]) => ({
        name,
        value
      }))

      // 生成月度趋势数据（最近12个月）
      const monthlyData = []
      const now = new Date()
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStr = date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' })

        // 这里应该从数据库查询实际的月度数据，暂时使用模拟数据
        monthlyData.push({
          month: monthStr,
          strains: Math.floor(Math.random() * 20) + 5,
          genomes: Math.floor(Math.random() * 15) + 3,
          analysis: Math.floor(Math.random() * 10) + 2
        })
      }

      // 生成最近活动数据
      const recentActivities = await generateRecentActivities(strainService, genomeService, analysisService)

      return {
        totalStrains: strainStats.total,
        totalGenomes: genomeStats.total,
        completedAnalysis: taskStats.completed,
        pendingTasks: taskStats.pending,
        speciesDistribution,
        monthlyData,
        recentActivities
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      // 返回默认数据
      return {
        totalStrains: 0,
        totalGenomes: 0,
        completedAnalysis: 0,
        pendingTasks: 0,
        speciesDistribution: [],
        monthlyData: [],
        recentActivities: []
      }
    }
  })

  // 生成最近活动数据的辅助函数
  async function generateRecentActivities(strainService, genomeService, analysisService) {
    try {
      const activities = []

      // 获取最近的菌株
      const recentStrains = await strainService.getRecentStrains(5)
      recentStrains.forEach((strain, index) => {
        activities.push({
          id: `strain-${strain.id}`,
          description: `新增菌株记录：${strain.strain_id}`,
          time: new Date(strain.created_at).toLocaleString(),
          type: 'success'
        })
      })

      // 获取最近的基因组
      const recentGenomes = await genomeService.getRecentGenomes(3)
      recentGenomes.forEach((genome, index) => {
        activities.push({
          id: `genome-${genome.id}`,
          description: `上传基因组文件：${genome.filename}`,
          time: new Date(genome.createdAt).toLocaleString(),
          type: 'info'
        })
      })

      // 获取最近完成的分析任务
      const recentTasks = await analysisService.getRecentCompletedTasks(3)
      recentTasks.forEach((task, index) => {
        activities.push({
          id: `task-${task.id}`,
          description: `完成分析任务：${task.name}`,
          time: new Date(task.completedAt).toLocaleString(),
          type: 'primary'
        })
      })

      // 按时间排序并返回最近的10条
      return activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 10)
    } catch (error) {
      console.error('生成最近活动数据失败:', error)
      return []
    }
  }

  // 系统配置相关
  ipcMain.handle('systemConfig:getAll', async () => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.getAllConfig()
  })

  ipcMain.handle('systemConfig:getSpecies', async () => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.getSpeciesConfig()
  })

  ipcMain.handle('systemConfig:saveSpecies', async (event, speciesData) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.saveSpecies(speciesData)
  })

  ipcMain.handle('systemConfig:deleteSpecies', async (event, id) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.deleteSpecies(id)
  })

  ipcMain.handle('systemConfig:getRegions', async () => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.getRegionsConfig()
  })

  ipcMain.handle('systemConfig:saveRegion', async (event, regionData) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.saveRegion(regionData)
  })

  ipcMain.handle('systemConfig:deleteRegion', async (event, id) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.deleteRegion(id)
  })

  ipcMain.handle('systemConfig:getSampleSources', async () => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.getSampleSourcesConfig()
  })

  ipcMain.handle('systemConfig:getProjects', async () => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.getProjectsConfig()
  })

  ipcMain.handle('systemConfig:saveProject', async (event, projectData) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.saveProject(projectData)
  })

  ipcMain.handle('systemConfig:deleteProject', async (event, id) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.deleteProject(id)
  })

  ipcMain.handle('systemConfig:saveSampleSource', async (event, sourceData) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.saveSampleSource(sourceData)
  })

  ipcMain.handle('systemConfig:deleteSampleSource', async (event, id) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.deleteSampleSource(id)
  })

  ipcMain.handle('systemConfig:getExperimentTypes', async () => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.getExperimentTypesConfig()
  })

  ipcMain.handle('systemConfig:saveExperimentType', async (event, typeData) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.saveExperimentType(typeData)
  })

  ipcMain.handle('systemConfig:deleteExperimentType', async (event, id) => {
    const systemConfigService = new SystemConfigService(dbService)
    return await systemConfigService.deleteExperimentType(id)
  })

  // NCBI相关
  ipcMain.handle('ncbi:searchTaxonomyId', async (event, scientificName) => {
    const ncbiService = new NCBIService()
    return await ncbiService.searchTaxonomyId(scientificName)
  })

  ipcMain.handle('ncbi:getTaxonomyDetails', async (event, txid) => {
    const ncbiService = new NCBIService()
    return await ncbiService.getTaxonomyDetails(txid)
  })

  ipcMain.handle('ncbi:validateTaxonomyId', async (event, txid) => {
    const ncbiService = new NCBIService()
    return await ncbiService.validateTaxonomyId(txid)
  })

  ipcMain.handle('ncbi:generateAbbreviation', async (event, scientificName) => {
    const ncbiService = new NCBIService()
    return ncbiService.generateAbbreviation(scientificName)
  })

  ipcMain.handle('ncbi:batchSearchTaxonomyIds', async (event, scientificNames) => {
    const ncbiService = new NCBIService()
    return await ncbiService.batchSearchTaxonomyIds(scientificNames)
  })

  // 生物信息学分析相关
  ipcMain.handle('bioinformatics:performMLSTAnalysis', async (event, genomeFiles, options) => {
    const bioinformaticsService = new BioinformaticsService(dbService)
    return await bioinformaticsService.performMLSTAnalysis(genomeFiles, options)
  })

  ipcMain.handle('bioinformatics:performSerotypingAnalysis', async (event, genomeFiles, options) => {
    const bioinformaticsService = new BioinformaticsService(dbService)
    return await bioinformaticsService.performSerotypingAnalysis(genomeFiles, options)
  })

  ipcMain.handle('bioinformatics:performVirulenceAnalysis', async (event, genomeFiles, options) => {
    const bioinformaticsService = new BioinformaticsService(dbService)
    return await bioinformaticsService.performVirulenceAnalysis(genomeFiles, options)
  })

  ipcMain.handle('bioinformatics:performResistanceAnalysis', async (event, genomeFiles, options) => {
    const bioinformaticsService = new BioinformaticsService(dbService)
    return await bioinformaticsService.performResistanceAnalysis(genomeFiles, options)
  })

  ipcMain.handle('bioinformatics:generateAnalysisReport', async (event, results) => {
    const bioinformaticsService = new BioinformaticsService(dbService)
    return bioinformaticsService.generateAnalysisReport(results)
  })
}

async function handleImportGenome() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Genome Files', extensions: ['fasta', 'fa', 'fna', 'gbk'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    mainWindow.webContents.send('import-genomes', result.filePaths)
  }
}

async function handleExportData() {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'JSON Files', extensions: ['json'] }
    ]
  })

  if (!result.canceled) {
    mainWindow.webContents.send('export-data', result.filePath)
  }
}

function showAboutDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: '关于PAMS',
    message: 'PAMS v0.1.0',
    detail: '实验室细菌基因组管理工具\n\n基于Electron + Vue.js + Node.js开发\n\n© 2024 PAMS Development Team',
    buttons: ['确定']
  })
}

// 应用事件处理
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()
})

// 处理应用退出
app.on('before-quit', async () => {
  if (dbService) {
    await dbService.close()
  }
}) 
