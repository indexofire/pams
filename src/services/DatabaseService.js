const initSqlJs = require('sql.js')
const path = require('path')
const fs = require('fs-extra')
const { app } = require('electron')
const bcrypt = require('bcryptjs')
const MigrationService = require('./MigrationService')
const PermissionService = require('./PermissionService')

class DatabaseService {
  constructor() {
    this.SQL = null
    this.db = null
    this.dbPath = null
  }

  async initialize() {
    // 初始化sql.js
    this.SQL = await initSqlJs()
    
    // 确定数据库路径
    const userDataPath = app.getPath('userData')
    this.dbPath = path.join(userDataPath, 'pams.db')
    
    // 确保目录存在
    await fs.ensureDir(path.dirname(this.dbPath))

    // 加载或创建数据库
    try {
      if (await fs.pathExists(this.dbPath)) {
        const data = await fs.readFile(this.dbPath)
        this.db = new this.SQL.Database(data)
        console.log('数据库加载成功:', this.dbPath)
      } else {
        this.db = new this.SQL.Database()
        console.log('数据库创建成功:', this.dbPath)
      }
    } catch (error) {
      console.error('数据库初始化失败:', error)
      this.db = new this.SQL.Database()
    }
    
    // 启用外键约束
    this.db.run('PRAGMA foreign_keys = ON')
    
    // 创建表结构
    this.createTables()

    // 创建默认数据
    await this.createDefaultData()

    // 初始化迁移服务并执行迁移
    this.migrationService = new MigrationService(this)
    await this.migrationService.runMigrations()

    // 初始化权限服务
    this.permissionService = new PermissionService(this)

    // 保存数据库
    await this.saveDatabase()
  }

  createTables() {
    // 用户表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        isActive INTEGER DEFAULT 1,
        displayName TEXT,
        laboratory TEXT,
        phone TEXT,
        language TEXT DEFAULT 'zh-CN',
        timezone TEXT DEFAULT 'Asia/Shanghai',
        theme TEXT DEFAULT 'light',
        showAdvancedData INTEGER DEFAULT 1,
        lastLogin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 添加新字段到现有用户表（如果不存在）
    try {
      this.db.run(`ALTER TABLE users ADD COLUMN displayName TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE users ADD COLUMN laboratory TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE users ADD COLUMN phone TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'zh-CN'`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE users ADD COLUMN timezone TEXT DEFAULT 'Asia/Shanghai'`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'light'`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE users ADD COLUMN showAdvancedData INTEGER DEFAULT 1`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    // 菌株表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS strains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        strain_id TEXT UNIQUE NOT NULL,
        species TEXT NOT NULL,
        sample_id TEXT,
        sample_source TEXT,
        region TEXT,
        experiment_type TEXT,
        onset_date TEXT,
        sampling_date TEXT,
        isolation_date TEXT,
        uploaded_by TEXT,
        virulence_genes TEXT,
        antibiotic_resistance TEXT,
        st_type TEXT,
        serotype TEXT,
        molecular_serotype TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 为现有菌株表添加实验类型字段（如果不存在）
    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN experiment_type TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    // 基因组表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS genomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        fileSize INTEGER,
        fileHash TEXT,
        sequencingPlatform TEXT,
        sequencingDate TEXT,
        assemblyMethod TEXT,
        totalLength INTEGER,
        contigCount INTEGER,
        n50 INTEGER,
        gcContent REAL,
        coverage REAL,
        geneCount INTEGER,
        codingSequences INTEGER,
        rrnaCount INTEGER,
        trnaCount INTEGER,
        mlstSt TEXT,
        serotype TEXT,
        virulenceGenes TEXT,
        resistanceGenes TEXT,
        plasmids TEXT,
        strainId INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (strainId) REFERENCES strains(id)
      )
    `)

    // 分析任务表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS analysis_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        parameters TEXT,
        results TEXT,
        errorMessage TEXT,
        startedAt TEXT,
        completedAt TEXT,
        createdBy INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `)

    // 任务-基因组关联表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS task_genomes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskId INTEGER NOT NULL,
        genomeId INTEGER NOT NULL,
        FOREIGN KEY (taskId) REFERENCES analysis_tasks(id),
        FOREIGN KEY (genomeId) REFERENCES genomes(id),
        UNIQUE(taskId, genomeId)
      )
    `)

    // 系统配置表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        config_key TEXT UNIQUE NOT NULL,
        config_value TEXT,
        config_type TEXT DEFAULT 'string',
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 菌种配置表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS species_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        scientific_name TEXT,
        abbreviation TEXT,
        ncbi_txid TEXT,
        description TEXT,
        status TEXT DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 为现有的species_config表添加新字段（如果不存在）
    try {
      this.db.run('ALTER TABLE species_config ADD COLUMN abbreviation TEXT')
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run('ALTER TABLE species_config ADD COLUMN ncbi_txid TEXT')
    } catch (e) {
      // 字段已存在，忽略错误
    }

    // 地区配置表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS regions_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT,
        level TEXT DEFAULT 'city',
        parent_id INTEGER,
        description TEXT,
        status TEXT DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES regions_config(id)
      )
    `)

    // 样本来源配置表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sample_sources_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category TEXT,
        description TEXT,
        status TEXT DEFAULT 'active',
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 实验类型配置表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS experiment_types_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'analysis',
        status TEXT DEFAULT 'active',
        sort_order INTEGER DEFAULT 999,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('数据库表结构创建完成')
  }

  async createDefaultData() {
    try {
      // 检查是否已存在管理员用户
      const checkStmt = this.db.prepare('SELECT id, password FROM users WHERE username = ?')
      checkStmt.bind(['admin'])
      let adminExists = null
      if (checkStmt.step()) {
        adminExists = checkStmt.getAsObject()
      }
      checkStmt.free()

      if (!adminExists) {
        const hashedPassword = await bcrypt.hash('admin123', 10)

        const insertStmt = this.db.prepare(`
          INSERT INTO users (username, email, password, role)
          VALUES (?, ?, ?, ?)
        `)

        insertStmt.bind(['admin', 'admin@pams.local', hashedPassword, 'admin'])
        insertStmt.step()
        insertStmt.free()

        console.log('默认管理员账户已创建: admin/admin123')

        // 保存数据库
        await this.saveDatabase()
      } else if (!adminExists.password) {
        // 如果管理员用户存在但没有密码，更新密码
        console.log('检测到管理员用户缺少密码，正在更新...')
        const hashedPassword = await bcrypt.hash('admin123', 10)

        const updateStmt = this.db.prepare(`
          UPDATE users SET password = ? WHERE username = ?
        `)

        updateStmt.bind([hashedPassword, 'admin'])
        updateStmt.step()
        updateStmt.free()
        console.log('管理员密码已更新')

        // 保存数据库
        await this.saveDatabase()
      } else {
        console.log('管理员用户已存在，密码正常')
      }

      // 验证用户是否正确创建
      const verifyStmt = this.db.prepare('SELECT id, username, password FROM users WHERE username = ?')
      verifyStmt.bind(['admin'])
      let verifyUser = null
      if (verifyStmt.step()) {
        verifyUser = verifyStmt.getAsObject()
      }
      verifyStmt.free()
      console.log('验证管理员用户:', verifyUser ? { id: verifyUser.id, username: verifyUser.username, hasPassword: !!verifyUser.password } : 'null')
    } catch (error) {
      console.error('创建默认数据失败:', error)
    }

    // 创建默认系统配置
    await this.createDefaultSystemConfig()

    // 创建默认菌种配置
    await this.createDefaultSpeciesConfig()

    // 创建默认地区配置
    await this.createDefaultRegionsConfig()

    // 创建默认样本来源配置
    await this.createDefaultSampleSourcesConfig()
  }

  async saveDatabase() {
    try {
      const data = this.db.export()
      await fs.writeFile(this.dbPath, data)
    } catch (error) {
      console.error('保存数据库失败:', error)
    }
  }

  // 用户相关方法
  getUsers() {
    try {
      const stmt = this.db.prepare('SELECT id, username, email, role, isActive, lastLogin, createdAt FROM users')
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return []
    }
  }

  getUserById(id) {
    try {
      const stmt = this.db.prepare('SELECT id, username, email, role, isActive, lastLogin, createdAt FROM users WHERE id = ?')
      stmt.bind([id])
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result
    } catch (error) {
      console.error('获取用户详情失败:', error)
      return null
    }
  }

  getUserByUsername(username) {
    try {
      const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?')
      stmt.bind([username])
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result
    } catch (error) {
      console.error('查询用户失败:', error)
      return null
    }
  }

  async createUser(userData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
      `)
      stmt.bind([userData.username, userData.email, userData.password, userData.role || 'user'])
      stmt.step()
      stmt.free()

      // 获取插入的ID
      const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
      let result = null
      if (idStmt.step()) {
        result = idStmt.getAsObject()
      }
      idStmt.free()

      await this.saveDatabase()
      return { id: result.id, ...userData }
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    }
  }

  async updateUser(id, userData) {
    const fields = []
    const values = []
    
    if (userData.username) {
      fields.push('username = ?')
      values.push(userData.username)
    }
    if (userData.email) {
      fields.push('email = ?')
      values.push(userData.email)
    }
    if (userData.password) {
      fields.push('password = ?')
      values.push(userData.password)
    }
    if (userData.role) {
      fields.push('role = ?')
      values.push(userData.role)
    }
    if (userData.hasOwnProperty('isActive')) {
      fields.push('isActive = ?')
      values.push(userData.isActive ? 1 : 0)
    }
    if (userData.lastLogin) {
      fields.push('lastLogin = ?')
      values.push(userData.lastLogin)
    }
    
    fields.push('updatedAt = CURRENT_TIMESTAMP')
    values.push(id)

    const stmt = this.db.prepare(`
      UPDATE users SET ${fields.join(', ')}
      WHERE id = ?
    `)
    stmt.bind(values)
    stmt.step()
    stmt.free()

    await this.saveDatabase()
    return this.getUserById(id)
  }

  async deleteUser(id) {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?')
    stmt.bind([id])
    stmt.step()
    stmt.free()

    await this.saveDatabase()
    return { success: true }
  }

  // 菌株相关方法
  getAllStrains() {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM strains
        ORDER BY created_at DESC
      `)
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取菌株列表失败:', error)
      return []
    }
  }

  getStrainById(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM strains WHERE id = ?')
      stmt.bind([id])
      if (stmt.step()) {
        const result = stmt.getAsObject()
        stmt.free()
        return result
      }
      stmt.free()
      return null
    } catch (error) {
      console.error('获取菌株详情失败:', error)
      return null
    }
  }

  async createStrain(strainData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO strains (
          strain_id, species, sample_id, sample_source, region, experiment_type,
          onset_date, sampling_date, isolation_date, uploaded_by,
          virulence_genes, antibiotic_resistance, st_type, serotype, molecular_serotype
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.bind([
        strainData.strain_id || null,
        strainData.species || null,
        strainData.sample_id || null,
        strainData.sample_source || null,
        strainData.region || null,
        strainData.experiment_type || null,
        strainData.onset_date || null,
        strainData.sampling_date || null,
        strainData.isolation_date || null,
        strainData.uploaded_by || null,
        strainData.virulence_genes || null,
        strainData.antibiotic_resistance || null,
        strainData.st_type || null,
        strainData.serotype || null,
        strainData.molecular_serotype || null
      ])
      
      // 检查执行结果
      const success = stmt.step()
      stmt.free()
      
      if (!success) {
        throw new Error('数据库插入失败，可能是数据重复或格式错误')
      }
      
      // 获取插入的ID
      const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
      const idSuccess = idStmt.step()
      if (!idSuccess) {
        idStmt.free()
        throw new Error('无法获取插入记录的ID')
      }
      
      const result = idStmt.getAsObject()
      idStmt.free()
      
      if (!result.id || result.id <= 0) {
        throw new Error('插入记录失败，未获得有效ID')
      }
      
      await this.saveDatabase()
      return { id: result.id, ...strainData }
    } catch (error) {
      console.error('创建菌株失败:', error)
      // 提供更详细的错误信息
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('菌株编号已存在，请使用不同的编号')
      } else if (error.message.includes('NOT NULL constraint failed')) {
        throw new Error('必填字段不能为空')
      } else {
        throw error
      }
    }
  }

  async updateStrain(id, strainData) {
    const stmt = this.db.prepare(`
      UPDATE strains SET
        strain_id = ?, species = ?, sample_id = ?, sample_source = ?, region = ?, experiment_type = ?,
        onset_date = ?, sampling_date = ?, isolation_date = ?, uploaded_by = ?,
        virulence_genes = ?, antibiotic_resistance = ?, st_type = ?, serotype = ?,
        molecular_serotype = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run([
      strainData.strain_id, strainData.species, strainData.sample_id,
      strainData.sample_source, strainData.region, strainData.experiment_type,
      strainData.onset_date, strainData.sampling_date, strainData.isolation_date,
      strainData.uploaded_by, strainData.virulence_genes, strainData.antibiotic_resistance,
      strainData.st_type, strainData.serotype, strainData.molecular_serotype, id
    ])
    
    await this.saveDatabase()
    return this.getStrainById(id)
  }

  async deleteStrain(id) {
    const stmt = this.db.prepare('DELETE FROM strains WHERE id = ?')
    stmt.run([id])
    await this.saveDatabase()
    return true
  }

  getStrainCount() {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM strains')
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result ? result.count : 0
    } catch (error) {
      console.error('获取菌株数量失败:', error)
      return 0
    }
  }

  // 基因组相关方法
  getAllGenomes() {
    try {
      const stmt = this.db.prepare(`
        SELECT g.*, s.strain_id, s.species
        FROM genomes g
        LEFT JOIN strains s ON g.strainId = s.id
        ORDER BY g.createdAt DESC
      `)
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取基因组列表失败:', error)
      return []
    }
  }

  getGenomeById(id) {
    try {
      const stmt = this.db.prepare('SELECT * FROM genomes WHERE id = ?')
      stmt.bind([id])
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result
    } catch (error) {
      console.error('获取基因组详情失败:', error)
      return null
    }
  }

  async createGenome(genomeData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO genomes (
          filename, filepath, fileSize, fileHash, sequencingPlatform,
          sequencingDate, assemblyMethod, strainId
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.bind([
        genomeData.filename, genomeData.filepath, genomeData.fileSize,
        genomeData.fileHash, genomeData.sequencingPlatform,
        genomeData.sequencingDate, genomeData.assemblyMethod,
        genomeData.strainId
      ])
      stmt.step()
      stmt.free()

      // 获取插入的ID
      const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
      let result = null
      if (idStmt.step()) {
        result = idStmt.getAsObject()
      }
      idStmt.free()

      await this.saveDatabase()
      return { id: result.id, ...genomeData }
    } catch (error) {
      console.error('创建基因组失败:', error)
      throw error
    }
  }

  async updateGenome(id, genomeData) {
    // 构建动态更新语句
    const fields = Object.keys(genomeData).filter(key => genomeData[key] !== undefined)
    if (fields.length === 0) return this.getGenomeById(id)
    
    const setClause = fields.map(field => `${field} = ?`).join(', ')
    const values = fields.map(field => genomeData[field])
    
    const stmt = this.db.prepare(`
      UPDATE genomes SET ${setClause}, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    stmt.run([...values, id])
    await this.saveDatabase()
    return this.getGenomeById(id)
  }

  getGenomeCount() {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM genomes')
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result ? result.count : 0
    } catch (error) {
      console.error('获取基因组数量失败:', error)
      return 0
    }
  }

  // 分析任务相关方法
  getAllTasks() {
    try {
      const stmt = this.db.prepare(`
        SELECT t.*, u.username as creatorName,
               COUNT(tg.genomeId) as genomeCount
        FROM analysis_tasks t
        LEFT JOIN users u ON t.createdBy = u.id
        LEFT JOIN task_genomes tg ON t.id = tg.taskId
        GROUP BY t.id
        ORDER BY t.createdAt DESC
      `)
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('getAllTasks SQL error:', error)
      return []
    }
  }

  async createTask(taskData) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO analysis_tasks (name, type, parameters, createdBy)
        VALUES (?, ?, ?, ?)
      `)

      stmt.bind([
        taskData.name, taskData.type,
        JSON.stringify(taskData.parameters),
        taskData.createdBy
      ])
      stmt.step()
      stmt.free()

      // 获取插入的ID
      const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
      let result = null
      if (idStmt.step()) {
        result = idStmt.getAsObject()
      }
      idStmt.free()

      await this.saveDatabase()
      return { id: result.id, ...taskData }
    } catch (error) {
      console.error('创建任务失败:', error)
      throw error
    }
  }

  async updateTaskStatus(id, status, progress, results, errorMessage) {
    const stmt = this.db.prepare(`
      UPDATE analysis_tasks SET
        status = ?, progress = ?, results = ?, errorMessage = ?,
        updatedAt = CURRENT_TIMESTAMP,
        completedAt = CASE WHEN ? IN ('completed', 'failed') THEN CURRENT_TIMESTAMP ELSE completedAt END
      WHERE id = ?
    `)
    
    stmt.run([status, progress, results, errorMessage, status, id])
    await this.saveDatabase()
  }

  getTaskStats() {
    try {
      const stmt = this.db.prepare(`
        SELECT
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status IN ('pending', 'running') THEN 1 ELSE 0 END) as pending
        FROM analysis_tasks
      `)
      let result = null
      if (stmt.step()) {
        result = stmt.getAsObject()
      }
      stmt.free()
      return result || { completed: 0, pending: 0 }
    } catch (error) {
      console.error('获取任务统计失败:', error)
      return { completed: 0, pending: 0 }
    }
  }

  // 系统配置相关方法
  async createDefaultSystemConfig() {
    const defaultConfigs = [
      { config_key: 'system_name', config_value: 'PAMS - 病原菌分析管理系统', description: '系统名称' },
      { config_key: 'system_version', config_value: '1.0.0', description: '系统版本' },
      { config_key: 'admin_email', config_value: 'admin@pams.com', description: '管理员邮箱' },
      { config_key: 'default_language', config_value: 'zh-CN', description: '默认语言' },
      { config_key: 'default_timezone', config_value: 'Asia/Shanghai', description: '默认时区' },
      { config_key: 'auto_backup', config_value: 'true', config_type: 'boolean', description: '自动备份' },
      { config_key: 'backup_interval', config_value: 'daily', description: '备份间隔' }
    ]

    for (const config of defaultConfigs) {
      try {
        const checkStmt = this.db.prepare('SELECT * FROM system_config WHERE config_key = ?')
        checkStmt.bind([config.config_key])
        let existing = null
        if (checkStmt.step()) {
          existing = checkStmt.getAsObject()
        }
        checkStmt.free()

        if (!existing) {
          const insertStmt = this.db.prepare(`
            INSERT INTO system_config (config_key, config_value, config_type, description)
            VALUES (?, ?, ?, ?)
          `)
          insertStmt.bind([config.config_key, config.config_value, config.config_type || 'string', config.description])
          insertStmt.step()
          insertStmt.free()
        }
      } catch (error) {
        console.error('创建系统配置失败:', error)
      }
    }
  }

  async createDefaultSpeciesConfig() {
    const defaultSpecies = [
      {
        name: '大肠杆菌',
        scientific_name: 'Escherichia coli',
        abbreviation: 'E. coli',
        ncbi_txid: '562',
        description: '常见的肠道细菌，重要的食源性病原菌',
        sort_order: 1
      },
      {
        name: '沙门氏菌',
        scientific_name: 'Salmonella enterica',
        abbreviation: 'S. enterica',
        ncbi_txid: '28901',
        description: '重要的食源性病原菌，引起肠胃炎',
        sort_order: 2
      },
      {
        name: '志贺氏菌',
        scientific_name: 'Shigella flexneri',
        abbreviation: 'S. flexneri',
        ncbi_txid: '623',
        description: '引起细菌性痢疾的病原菌',
        sort_order: 3
      },
      {
        name: '霍乱弧菌',
        scientific_name: 'Vibrio cholerae',
        abbreviation: 'V. cholerae',
        ncbi_txid: '666',
        description: '引起霍乱的水生细菌',
        sort_order: 4
      },
      {
        name: '金黄色葡萄球菌',
        scientific_name: 'Staphylococcus aureus',
        abbreviation: 'S. aureus',
        ncbi_txid: '1280',
        description: '常见的致病菌，可引起多种感染',
        sort_order: 5
      }
    ]

    for (const species of defaultSpecies) {
      try {
        const checkStmt = this.db.prepare('SELECT * FROM species_config WHERE name = ?')
        checkStmt.bind([species.name])
        let existing = null
        if (checkStmt.step()) {
          existing = checkStmt.getAsObject()
        }
        checkStmt.free()

        if (!existing) {
          const insertStmt = this.db.prepare(`
            INSERT INTO species_config (name, scientific_name, abbreviation, ncbi_txid, description, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)
          `)
          insertStmt.bind([
            species.name,
            species.scientific_name,
            species.abbreviation || null,
            species.ncbi_txid || null,
            species.description,
            species.sort_order
          ])
          insertStmt.step()
          insertStmt.free()
        }
      } catch (error) {
        console.error('创建菌种配置失败:', error)
      }
    }
  }

  async createDefaultRegionsConfig() {
    const defaultRegions = [
      { name: '北京市', code: '110000', level: 'province', sort_order: 1 },
      { name: '上海市', code: '310000', level: 'province', sort_order: 2 },
      { name: '广东省', code: '440000', level: 'province', sort_order: 3 },
      { name: '江苏省', code: '320000', level: 'province', sort_order: 4 },
      { name: '浙江省', code: '330000', level: 'province', sort_order: 5 }
    ]

    for (const region of defaultRegions) {
      try {
        const checkStmt = this.db.prepare('SELECT * FROM regions_config WHERE name = ? AND level = ?')
        checkStmt.bind([region.name, region.level])
        let existing = null
        if (checkStmt.step()) {
          existing = checkStmt.getAsObject()
        }
        checkStmt.free()

        if (!existing) {
          const insertStmt = this.db.prepare(`
            INSERT INTO regions_config (name, code, level, sort_order)
            VALUES (?, ?, ?, ?)
          `)
          insertStmt.bind([region.name, region.code, region.level, region.sort_order])
          insertStmt.step()
          insertStmt.free()
        }
      } catch (error) {
        console.error('创建地区配置失败:', error)
      }
    }
  }

  async createDefaultSampleSourcesConfig() {
    const defaultSources = [
      { name: '血液', category: 'clinical', description: '临床血液样本', sort_order: 1 },
      { name: '粪便', category: 'clinical', description: '临床粪便样本', sort_order: 2 },
      { name: '尿液', category: 'clinical', description: '临床尿液样本', sort_order: 3 },
      { name: '肉类', category: 'food', description: '肉类食品样本', sort_order: 4 },
      { name: '蔬菜', category: 'food', description: '蔬菜食品样本', sort_order: 5 }
    ]

    for (const source of defaultSources) {
      try {
        const checkStmt = this.db.prepare('SELECT * FROM sample_sources_config WHERE name = ?')
        checkStmt.bind([source.name])
        let existing = null
        if (checkStmt.step()) {
          existing = checkStmt.getAsObject()
        }
        checkStmt.free()

        if (!existing) {
          const insertStmt = this.db.prepare(`
            INSERT INTO sample_sources_config (name, category, description, sort_order)
            VALUES (?, ?, ?, ?)
          `)
          insertStmt.bind([source.name, source.category, source.description, source.sort_order])
          insertStmt.step()
          insertStmt.free()
        }
      } catch (error) {
        console.error('创建样本来源配置失败:', error)
      }
    }

    // 初始化默认实验类型
    const defaultExperimentTypes = [
      { name: 'MLST分析', code: 'mlst', description: '多位点序列分型分析', category: 'typing', sort_order: 1 },
      { name: '血清分型', code: 'serotyping', description: '血清学分型分析', category: 'typing', sort_order: 2 },
      { name: '毒力基因检测', code: 'virulence', description: '毒力基因分析', category: 'gene_analysis', sort_order: 3 },
      { name: '耐药基因检测', code: 'resistance', description: '耐药基因分析', category: 'gene_analysis', sort_order: 4 },
      { name: '全基因组测序', code: 'wgs', description: '全基因组序列分析', category: 'sequencing', sort_order: 5 },
      { name: '比较基因组学', code: 'comparative', description: '比较基因组分析', category: 'analysis', sort_order: 6 },
      { name: '系统发育分析', code: 'phylogeny', description: '系统发育树构建', category: 'analysis', sort_order: 7 },
      { name: '基因组注释', code: 'annotation', description: '基因组功能注释', category: 'annotation', sort_order: 8 }
    ]

    for (const type of defaultExperimentTypes) {
      try {
        const checkStmt = this.db.prepare('SELECT * FROM experiment_types_config WHERE code = ?')
        checkStmt.bind([type.code])
        let existing = null
        if (checkStmt.step()) {
          existing = checkStmt.getAsObject()
        }
        checkStmt.free()

        if (!existing) {
          const insertStmt = this.db.prepare(`
            INSERT INTO experiment_types_config (name, code, description, category, sort_order)
            VALUES (?, ?, ?, ?, ?)
          `)
          insertStmt.bind([type.name, type.code, type.description, type.category, type.sort_order])
          insertStmt.step()
          insertStmt.free()
        }
      } catch (error) {
        console.error('创建实验类型配置失败:', error)
      }
    }
  }

  // 获取系统配置
  getSystemConfig() {
    try {
      const stmt = this.db.prepare('SELECT * FROM system_config ORDER BY config_key')
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取系统配置失败:', error)
      return []
    }
  }

  // 获取菌种配置
  getSpeciesConfig() {
    try {
      const stmt = this.db.prepare('SELECT * FROM species_config WHERE status = ? ORDER BY sort_order, name')
      stmt.bind(['active'])
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取菌种配置失败:', error)
      return []
    }
  }

  // 获取地区配置
  getRegionsConfig() {
    try {
      const stmt = this.db.prepare('SELECT * FROM regions_config WHERE status = ? ORDER BY sort_order, name')
      stmt.bind(['active'])
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取地区配置失败:', error)
      return []
    }
  }

  // 获取样本来源配置
  getSampleSourcesConfig() {
    try {
      const stmt = this.db.prepare('SELECT * FROM sample_sources_config WHERE status = ? ORDER BY sort_order, name')
      stmt.bind(['active'])
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取样本来源配置失败:', error)
      return []
    }
  }

  // 获取实验类型配置
  getExperimentTypesConfig() {
    try {
      const stmt = this.db.prepare('SELECT * FROM experiment_types_config WHERE status = ? ORDER BY sort_order, name')
      stmt.bind(['active'])
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取实验类型配置失败:', error)
      return []
    }
  }

  async close() {
    if (this.db) {
      await this.saveDatabase()
      this.db.close()
      console.log('数据库连接已关闭')
    }
  }
}

module.exports = DatabaseService 