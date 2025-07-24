#!/usr/bin/env node

/**
 * 清除PAMS数据库脚本
 * 用于开发环境清除所有数据，重新开始
 */

const fs = require('fs-extra')
const path = require('path')
const os = require('os')

async function clearDatabase() {
  try {
    console.log('🗑️  开始清除PAMS数据库...')

    // 获取数据库路径
    let dbPath
    if (process.platform === 'win32') {
      dbPath = path.join(process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming'), 'pams', 'pams.db')
    } else if (process.platform === 'darwin') {
      dbPath = path.join(os.homedir(), 'Library', 'Application Support', 'pams', 'pams.db')
    } else {
      dbPath = path.join(os.homedir(), '.config', 'pams', 'pams.db')
    }
    
    console.log(`📍 数据库路径: ${dbPath}`)
    
    // 检查数据库文件是否存在
    if (await fs.pathExists(dbPath)) {
      console.log('📁 发现数据库文件，正在删除...')
      await fs.remove(dbPath)
      console.log('✅ 数据库文件已删除')
    } else {
      console.log('ℹ️  数据库文件不存在')
    }
    
    // 清除用户数据目录下的其他文件
    const userDataDir = path.dirname(dbPath)
    if (await fs.pathExists(userDataDir)) {
      console.log('🧹 清理用户数据目录...')
      const files = await fs.readdir(userDataDir)
      for (const file of files) {
        const filePath = path.join(userDataDir, file)
        const stat = await fs.stat(filePath)
        if (stat.isFile() && file !== 'pams.db') {
          console.log(`  删除文件: ${file}`)
          await fs.remove(filePath)
        }
      }
    }
    
    console.log('🎉 数据库清除完成！')
    console.log('💡 下次启动PAMS时将创建全新的数据库')
    
  } catch (error) {
    console.error('❌ 清除数据库失败:', error.message)
    process.exit(1)
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  clearDatabase()
}

module.exports = { clearDatabase }
