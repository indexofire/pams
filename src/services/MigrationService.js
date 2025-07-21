/**
 * 数据库迁移服务
 * 管理数据库版本和结构变更
 */

const fs = require('fs-extra')
const path = require('path')

class MigrationService {
  constructor(databaseService) {
    this.db = databaseService
    this.currentVersion = '1.0.0'
    this.migrationsPath = path.join(__dirname, '../migrations')
    this.initializeMigrationTable()
  }

  /**
   * 初始化迁移表
   */
  initializeMigrationTable() {
    try {
      this.db.db.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          version TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          executed_at TEXT DEFAULT CURRENT_TIMESTAMP,
          checksum TEXT
        )
      `)
      console.log('迁移表初始化完成')
    } catch (error) {
      console.error('初始化迁移表失败:', error)
    }
  }

  /**
   * 获取当前数据库版本
   */
  getCurrentVersion() {
    try {
      const stmt = this.db.db.prepare(`
        SELECT version FROM migrations
        ORDER BY executed_at DESC
        LIMIT 1
      `)

      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()

      return result ? result.version : '0.0.0'
    } catch (error) {
      console.error('获取数据库版本失败:', error)
      return '0.0.0'
    }
  }

  /**
   * 执行数据库迁移
   */
  async runMigrations() {
    try {
      const currentVersion = this.getCurrentVersion()
      console.log(`当前数据库版本: ${currentVersion}`)
      
      const migrations = this.getMigrations()
      const pendingMigrations = migrations.filter(migration => 
        this.compareVersions(migration.version, currentVersion) > 0
      )

      if (pendingMigrations.length === 0) {
        console.log('没有待执行的迁移')
        return
      }

      console.log(`发现 ${pendingMigrations.length} 个待执行的迁移`)

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration)
      }

      console.log('所有迁移执行完成')
    } catch (error) {
      console.error('执行迁移失败:', error)
      throw error
    }
  }

  /**
   * 获取所有迁移
   */
  getMigrations() {
    const migrations = [
      {
        version: '1.0.1',
        name: 'add_experiment_type_to_strains',
        description: '为菌株表添加实验类型字段',
        up: () => {
          try {
            this.db.db.run('ALTER TABLE strains ADD COLUMN experiment_type TEXT')
          } catch (e) {
            // 字段已存在，忽略错误
          }
        }
      },
      {
        version: '1.0.2',
        name: 'add_indexes_for_performance',
        description: '添加性能优化索引',
        up: () => {
          const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_strains_species ON strains(species)',
            'CREATE INDEX IF NOT EXISTS idx_strains_region ON strains(region)',
            'CREATE INDEX IF NOT EXISTS idx_strains_sample_source ON strains(sample_source)',
            'CREATE INDEX IF NOT EXISTS idx_strains_experiment_type ON strains(experiment_type)',
            'CREATE INDEX IF NOT EXISTS idx_strains_created_at ON strains(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_genomes_strain_id ON genomes(strain_id)',
            'CREATE INDEX IF NOT EXISTS idx_genomes_species ON genomes(species)',
            'CREATE INDEX IF NOT EXISTS idx_genomes_created_at ON genomes(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_analysis_tasks_task_type ON analysis_tasks(task_type)',
            'CREATE INDEX IF NOT EXISTS idx_analysis_tasks_status ON analysis_tasks(status)',
            'CREATE INDEX IF NOT EXISTS idx_analysis_tasks_created_by ON analysis_tasks(created_by)'
          ]
          
          indexes.forEach(sql => {
            try {
              this.db.db.run(sql)
            } catch (e) {
              console.warn('创建索引失败:', e.message)
            }
          })
        }
      },
      {
        version: '1.0.3',
        name: 'optimize_table_structure',
        description: '优化表结构',
        up: () => {
          // 为用户表添加索引
          try {
            this.db.db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)')
            this.db.db.run('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)')
            this.db.db.run('CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)')
          } catch (e) {
            console.warn('创建用户表索引失败:', e.message)
          }

          // 为审计日志表添加索引
          try {
            this.db.db.run('CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type)')
            this.db.db.run('CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username)')
            this.db.db.run('CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp)')
          } catch (e) {
            console.warn('创建审计日志表索引失败:', e.message)
          }
        }
      },
      {
        version: '1.0.4',
        name: 'add_foreign_key_constraints',
        description: '添加外键约束（仅记录，SQLite默认不启用外键）',
        up: () => {
          // SQLite默认不启用外键约束，这里只是记录
          console.log('外键约束已在表创建时定义')
        }
      },
      {
        version: '1.0.5',
        name: 'add_genome_sequencing_info',
        description: '为基因组表添加组装软件、测序平台等信息字段',
        up: () => {
          try {
            // 添加组装软件名称字段
            this.db.db.run('ALTER TABLE genomes ADD COLUMN assembly_software TEXT')
          } catch (e) {
            if (!e.message.includes('duplicate column name')) {
              console.warn('添加assembly_software字段失败:', e.message)
            }
          }

          try {
            // 添加组装软件版本字段
            this.db.db.run('ALTER TABLE genomes ADD COLUMN assembly_version TEXT')
          } catch (e) {
            if (!e.message.includes('duplicate column name')) {
              console.warn('添加assembly_version字段失败:', e.message)
            }
          }

          try {
            // 添加测序平台字段
            this.db.db.run('ALTER TABLE genomes ADD COLUMN sequencing_platform TEXT')
          } catch (e) {
            if (!e.message.includes('duplicate column name')) {
              console.warn('添加sequencing_platform字段失败:', e.message)
            }
          }

          try {
            // 添加测序模式字段
            this.db.db.run('ALTER TABLE genomes ADD COLUMN sequencing_mode TEXT')
          } catch (e) {
            if (!e.message.includes('duplicate column name')) {
              console.warn('添加sequencing_mode字段失败:', e.message)
            }
          }

          try {
            // 添加测序深度字段
            this.db.db.run('ALTER TABLE genomes ADD COLUMN sequencing_depth REAL')
          } catch (e) {
            if (!e.message.includes('duplicate column name')) {
              console.warn('添加sequencing_depth字段失败:', e.message)
            }
          }

          try {
            // 添加N50值字段
            this.db.db.run('ALTER TABLE genomes ADD COLUMN n50_value INTEGER')
          } catch (e) {
            if (!e.message.includes('duplicate column name')) {
              console.warn('添加n50_value字段失败:', e.message)
            }
          }

          console.log('基因组测序信息字段添加完成')
        }
      }
    ]

    return migrations.sort((a, b) => this.compareVersions(a.version, b.version))
  }

  /**
   * 执行单个迁移
   */
  async executeMigration(migration) {
    try {
      console.log(`执行迁移: ${migration.version} - ${migration.name}`)
      
      // 开始事务
      this.db.db.run('BEGIN TRANSACTION')
      
      try {
        // 执行迁移
        await migration.up()
        
        // 记录迁移
        const stmt = this.db.db.prepare(`
          INSERT INTO migrations (version, name, checksum)
          VALUES (?, ?, ?)
        `)
        
        const checksum = this.calculateChecksum(migration)
        stmt.run(migration.version, migration.name, checksum)
        
        // 提交事务
        this.db.db.run('COMMIT')
        
        console.log(`迁移 ${migration.version} 执行成功`)
      } catch (error) {
        // 回滚事务
        this.db.db.run('ROLLBACK')
        throw error
      }
    } catch (error) {
      console.error(`迁移 ${migration.version} 执行失败:`, error)
      throw error
    }
  }

  /**
   * 计算迁移校验和
   */
  calculateChecksum(migration) {
    const crypto = require('crypto')
    const content = migration.up.toString() + migration.version + migration.name
    return crypto.createHash('md5').update(content).digest('hex')
  }

  /**
   * 比较版本号
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number)
    const v2Parts = version2.split('.').map(Number)
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length)
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part > v2Part) return 1
      if (v1Part < v2Part) return -1
    }
    
    return 0
  }

  /**
   * 获取迁移历史
   */
  getMigrationHistory() {
    try {
      const stmt = this.db.db.prepare(`
        SELECT * FROM migrations 
        ORDER BY executed_at DESC
      `)
      
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      
      return results
    } catch (error) {
      console.error('获取迁移历史失败:', error)
      return []
    }
  }

  /**
   * 数据库健康检查
   */
  async healthCheck() {
    try {
      const checks = []
      
      // 检查表完整性
      const tables = ['users', 'strains', 'genomes', 'analysis_tasks', 'migrations']
      for (const table of tables) {
        try {
          const stmt = this.db.db.prepare(`SELECT COUNT(*) as count FROM ${table}`)
          let result = null
          if (stmt.step()) {
            result = stmt.getAsObject()
          }
          stmt.free()
          
          checks.push({
            type: 'table_integrity',
            table,
            status: 'ok',
            count: result ? result.count : 0
          })
        } catch (error) {
          checks.push({
            type: 'table_integrity',
            table,
            status: 'error',
            error: error.message
          })
        }
      }
      
      // 检查索引
      try {
        const stmt = this.db.db.prepare(`
          SELECT name FROM sqlite_master 
          WHERE type = 'index' AND name LIKE 'idx_%'
        `)
        
        const indexes = []
        while (stmt.step()) {
          indexes.push(stmt.getAsObject().name)
        }
        stmt.free()
        
        checks.push({
          type: 'indexes',
          status: 'ok',
          count: indexes.length,
          indexes
        })
      } catch (error) {
        checks.push({
          type: 'indexes',
          status: 'error',
          error: error.message
        })
      }
      
      // 检查数据库大小
      try {
        const stmt = this.db.db.prepare('PRAGMA page_count')
        let pageCount = 0
        if (stmt.step()) {
          pageCount = stmt.getAsObject()['page_count']
        }
        stmt.free()
        
        const pageSizeStmt = this.db.db.prepare('PRAGMA page_size')
        let pageSize = 0
        if (pageSizeStmt.step()) {
          pageSize = pageSizeStmt.getAsObject()['page_size']
        }
        pageSizeStmt.free()
        
        const dbSize = pageCount * pageSize
        
        checks.push({
          type: 'database_size',
          status: 'ok',
          size_bytes: dbSize,
          size_mb: (dbSize / 1024 / 1024).toFixed(2)
        })
      } catch (error) {
        checks.push({
          type: 'database_size',
          status: 'error',
          error: error.message
        })
      }
      
      return {
        status: checks.every(check => check.status === 'ok') ? 'healthy' : 'warning',
        checks,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('数据库健康检查失败:', error)
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * 优化数据库
   */
  async optimizeDatabase() {
    try {
      console.log('开始数据库优化...')
      
      // 分析表统计信息
      this.db.db.run('ANALYZE')
      
      // 清理数据库
      this.db.db.run('VACUUM')
      
      // 重建索引
      this.db.db.run('REINDEX')
      
      console.log('数据库优化完成')
      
      return {
        status: 'success',
        message: '数据库优化完成',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('数据库优化失败:', error)
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

module.exports = MigrationService
