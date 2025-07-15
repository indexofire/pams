const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs-extra')
const isDev = process.env.NODE_ENV === 'development'
const electronReload =require('electron-reload')
electronReload(__dirname, {electron:require('electron')})

// 导入后端服务
const DatabaseService = require('../src/services/DatabaseService')
const StrainService = require('../src/services/StrainService')
const GenomeService = require('../src/services/GenomeService')
const AnalysisService = require('../src/services/AnalysisService')
const UserService = require('../src/services/UserService')

let mainWindow
let dbService

async function createWindow() {
  // 初始化数据库
  try {
    dbService = new DatabaseService()
    await dbService.initialize()
    console.log('数据库初始化成功')
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
    mainWindow.loadURL('http://localhost:8080')
    mainWindow.webContents.openDevTools()
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
    const userService = new UserService(dbService)
    return await userService.login(username, password)
  })

  ipcMain.handle('auth:register', async (event, userData) => {
    const userService = new UserService(dbService)
    return await userService.register(userData)
  })

  // 菌株相关
  ipcMain.handle('strains:getAll', async () => {
    const strainService = new StrainService(dbService)
    return await strainService.getAllStrains()
  })

  ipcMain.handle('strains:create', async (event, strainData) => {
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
    return await strainService.createStrain(processedData)
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

    const [strainCount, genomeCount, taskStats] = await Promise.all([
      strainService.getStrainCount(),
      genomeService.getGenomeCount(),
      analysisService.getTaskStats()
    ])

    return {
      totalStrains: strainCount,
      totalGenomes: genomeCount,
      completedAnalysis: taskStats.completed,
      pendingTasks: taskStats.pending
    }
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
