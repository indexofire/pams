const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('path')
const isDev = process.env.NODE_ENV === 'development'

let mainWindow

function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, '../frontend/public/favicon.ico'),
    show: false
  })

  // 加载应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080')
    // 开发环境下打开开发者工具
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'))
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 当窗口被关闭时
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 设置菜单
  setApplicationMenu()
}

function setApplicationMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '导入数据',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('menu-import-data')
          }
        },
        {
          label: '导出报告',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('menu-export-report')
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
            mainWindow.webContents.send('menu-genome-annotation')
          }
        },
        {
          label: '系统发育分析',
          click: () => {
            mainWindow.webContents.send('menu-phylogenetic-analysis')
          }
        },
        {
          label: '耐药基因检测',
          click: () => {
            mainWindow.webContents.send('menu-resistance-genes')
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
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于PAMS',
              message: 'PAMS v0.1.0',
              detail: '实验室细菌基因组管理工具\n\n基于Electron + Vue.js + Flask开发'
            })
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

// 当所有窗口都被关闭时退出应用
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

// 应用准备就绪时创建窗口
app.whenReady().then(createWindow)

// IPC通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('show-save-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: 'CSV Files', extensions: ['csv'] },
      { name: 'Excel Files', extensions: ['xlsx'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
})

ipcMain.handle('show-open-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Genome Files', extensions: ['fasta', 'fa', 'fna', 'gbk'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  return result
}) 