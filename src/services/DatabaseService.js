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
        sequence_number INTEGER,
        strain_id TEXT UNIQUE NOT NULL,
        species TEXT NOT NULL,
        sample_id TEXT,
        sample_source TEXT,
        region TEXT,
        project_source TEXT,
        experiment_type TEXT,
        onset_date TEXT,
        sampling_date TEXT,
        isolation_date TEXT,
        submission_date TEXT,
        patient_name TEXT,
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

    // 为现有菌株表添加新字段（如果不存在）
    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN experiment_type TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN sequence_number INTEGER`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN project_source TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_gender TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_age INTEGER`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_id_number TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }



    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN submission_date TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_name TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_gender TEXT`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_age INTEGER`)
    } catch (e) {
      // 字段已存在，忽略错误
    }

    try {
      this.db.run(`ALTER TABLE strains ADD COLUMN patient_id_number TEXT`)
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
        sort_order INTEGER DEFAULT 999,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 项目配置表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS projects_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
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
      }
    } catch (error) {
      console.error('创建默认数据失败:', error)
    }

    // 创建默认系统配置
    await this.createDefaultSystemConfig()
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
        ORDER BY sequence_number ASC
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

  getNextSequenceNumber() {
    try {
      const stmt = this.db.prepare('SELECT MAX(sequence_number) as max_seq FROM strains')
      if (stmt.step()) {
        const result = stmt.getAsObject()
        stmt.free()
        return (result.max_seq || 0) + 1
      }
      stmt.free()
      return 1
    } catch (error) {
      console.error('获取下一个序号失败:', error)
      return 1
    }
  }

  // 检查菌株表结构
  checkStrainsTableStructure() {
    try {
      const stmt = this.db.prepare('PRAGMA table_info(strains)')
      const columns = []
      while (stmt.step()) {
        const row = stmt.getAsObject()
        columns.push(row.name)
      }
      stmt.free()

      console.log('菌株表当前字段:', columns)

      // 检查必需字段是否存在
      const requiredFields = [
        'id', 'sequence_number', 'strain_id', 'species', 'sample_id', 'sample_source',
        'region', 'project_source', 'experiment_type', 'onset_date', 'sampling_date',
        'isolation_date', 'submission_date', 'patient_name', 'patient_gender',
        'patient_age', 'patient_id_number', 'uploaded_by', 'virulence_genes',
        'antibiotic_resistance', 'st_type', 'serotype', 'molecular_serotype',
        'created_at', 'updated_at'
      ]

      const missingFields = requiredFields.filter(field => !columns.includes(field))
      if (missingFields.length > 0) {
        console.warn('菌株表缺少字段:', missingFields)
      }

      return { columns, missingFields }
    } catch (error) {
      console.error('检查表结构失败:', error)
      return { columns: [], missingFields: [] }
    }
  }

  getNextAvailableId() {
    try {
      const stmt = this.db.prepare('SELECT MAX(id) as max_id FROM strains')
      if (stmt.step()) {
        const result = stmt.getAsObject()
        stmt.free()
        return (result.max_id || 0) + 1
      }
      stmt.free()
      return 1
    } catch (error) {
      console.error('获取下一个可用ID失败:', error)
      return 1
    }
  }

  async createStrain(strainData) {
    try {
      console.log('创建菌株，输入数据:', strainData)

      // 检查表结构
      this.checkStrainsTableStructure()

      // 验证必填字段
      if (!strainData.strain_id) {
        throw new Error('菌株编号不能为空')
      }
      if (!strainData.species) {
        throw new Error('菌种不能为空')
      }

      // 生成序号
      const sequenceNumber = this.getNextSequenceNumber()
      console.log('生成序号:', sequenceNumber)

      const stmt = this.db.prepare(`
        INSERT INTO strains (
          sequence_number, strain_id, species, sample_id, sample_source, region, project_source, experiment_type,
          onset_date, sampling_date, isolation_date, submission_date, patient_name, patient_gender, patient_age, patient_id_number, uploaded_by,
          virulence_genes, antibiotic_resistance, st_type, serotype, molecular_serotype
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const bindValues = [
        sequenceNumber,
        strainData.strain_id || null,
        strainData.species || null,
        strainData.sample_id || null,
        strainData.sample_source || null,
        strainData.region || null,
        strainData.project_source || null,
        strainData.experiment_type || null,
        strainData.onset_date || null,
        strainData.sampling_date || null,
        strainData.isolation_date || null,
        strainData.submission_date || null,
        strainData.patient_name || null,
        strainData.patient_gender || null,
        strainData.patient_age || null,
        strainData.patient_id_number || null,
        strainData.uploaded_by || null,
        strainData.virulence_genes || null,
        strainData.antibiotic_resistance || null,
        strainData.st_type || null,
        strainData.serotype || null,
        strainData.molecular_serotype || null
      ]

      console.log('绑定参数:', bindValues)
      stmt.bind(bindValues)

      // 执行插入 - 对于INSERT语句，step()执行后不需要检查返回值
      // 如果有错误，会抛出异常
      try {
        stmt.step()
        console.log('插入执行成功')
      } catch (execError) {
        stmt.free()
        console.error('SQL执行错误:', execError)
        throw execError
      }

      stmt.free()

      // 获取插入的ID
      const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
      const idSuccess = idStmt.step()
      if (!idSuccess) {
        idStmt.free()
        throw new Error('无法获取插入记录的ID')
      }

      const result = idStmt.getAsObject()
      idStmt.free()

      console.log('插入结果ID:', result.id)

      if (!result.id || result.id <= 0) {
        throw new Error('插入记录失败，未获得有效ID')
      }

      await this.saveDatabase()
      return { id: result.id, ...strainData }
    } catch (error) {
      console.error('创建菌株失败:', error)
      console.error('错误详情:', error.message)
      console.error('错误堆栈:', error.stack)

      // 提供更详细的错误信息
      if (error.message.includes('UNIQUE constraint failed')) {
        if (error.message.includes('strain_id')) {
          throw new Error('菌株编号已存在，请使用不同的编号')
        } else {
          throw new Error('数据重复，请检查输入信息')
        }
      } else if (error.message.includes('NOT NULL constraint failed')) {
        const field = error.message.match(/NOT NULL constraint failed: strains\.(\w+)/)?.[1]
        if (field) {
          throw new Error(`字段 ${field} 不能为空`)
        } else {
          throw new Error('必填字段不能为空')
        }
      } else if (error.message.includes('no such column')) {
        const column = error.message.match(/no such column: (\w+)/)?.[1]
        throw new Error(`数据库字段 ${column} 不存在，请联系管理员`)
      } else {
        throw error
      }
    }
  }

  async updateStrain(id, strainData) {
    const stmt = this.db.prepare(`
      UPDATE strains SET
        strain_id = ?, species = ?, sample_id = ?, sample_source = ?, region = ?, project_source = ?, experiment_type = ?,
        onset_date = ?, sampling_date = ?, isolation_date = ?, submission_date = ?, patient_name = ?, patient_gender = ?, patient_age = ?, patient_id_number = ?, uploaded_by = ?,
        virulence_genes = ?, antibiotic_resistance = ?, st_type = ?, serotype = ?,
        molecular_serotype = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    stmt.run([
      strainData.strain_id, strainData.species, strainData.sample_id,
      strainData.sample_source, strainData.region, strainData.project_source, strainData.experiment_type,
      strainData.onset_date, strainData.sampling_date, strainData.isolation_date,
      strainData.submission_date, strainData.patient_name, strainData.patient_gender, strainData.patient_age, strainData.patient_id_number, strainData.uploaded_by,
      strainData.virulence_genes, strainData.antibiotic_resistance,
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
          sequencingDate, assemblyMethod, strainId, totalLength, contigCount,
          n50, gcContent, coverage, assembly_software, assembly_version,
          sequencing_mode, sequencing_depth, n50_value
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.bind([
        genomeData.filename || genomeData.file_name,
        genomeData.filepath || genomeData.file_path,
        genomeData.fileSize || genomeData.file_size,
        genomeData.fileHash || genomeData.file_hash,
        genomeData.sequencingPlatform || genomeData.sequencing_platform,
        genomeData.sequencingDate || genomeData.upload_date,
        genomeData.assemblyMethod || genomeData.assembly_software,
        genomeData.strainId || genomeData.strain_id,
        genomeData.totalLength || genomeData.total_length,
        genomeData.contigCount || genomeData.sequence_count,
        genomeData.n50,
        genomeData.gcContent || genomeData.gc_content,
        genomeData.coverage,
        genomeData.assembly_software,
        genomeData.assembly_version,
        genomeData.sequencing_mode,
        genomeData.sequencing_depth,
        genomeData.n50_value
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

  // 获取项目配置
  getProjectsConfig() {
    try {
      const stmt = this.db.prepare('SELECT * FROM projects_config WHERE status = ? ORDER BY sort_order, name')
      stmt.bind(['active'])
      const results = []
      while (stmt.step()) {
        results.push(stmt.getAsObject())
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('获取项目配置失败:', error)
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

  /**
   * 清空所有数据表（保留表结构）
   */
  async clearAllData() {
    try {
      console.log('开始清空所有数据表...')

      // 禁用外键约束
      this.db.run('PRAGMA foreign_keys = OFF')

      // 获取所有表名
      const stmt = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      const tables = []
      while (stmt.step()) {
        const row = stmt.getAsObject()
        tables.push(row.name)
      }
      stmt.free()

      // 清空所有表
      for (const tableName of tables) {
        try {
          this.db.run(`DELETE FROM ${tableName}`)
          console.log(`已清空表: ${tableName}`)
        } catch (error) {
          console.warn(`清空表 ${tableName} 失败:`, error.message)
        }
      }

      // 重置自增ID
      this.db.run("DELETE FROM sqlite_sequence")

      // 重新启用外键约束
      this.db.run('PRAGMA foreign_keys = ON')

      // 重新创建默认数据
      await this.createDefaultData()

      // 保存数据库
      await this.saveDatabase()

      console.log('所有数据表已清空并重新初始化')
      return { success: true, message: '数据库已重置' }
    } catch (error) {
      console.error('清空数据库失败:', error)
      throw new Error('清空数据库失败: ' + error.message)
    }
  }

  /**
   * 完全重置数据库（删除文件重新创建）
   */
  async resetDatabase() {
    try {
      console.log('开始重置数据库...')

      // 关闭当前数据库连接
      if (this.db) {
        this.db.close()
      }

      // 删除数据库文件
      if (await fs.pathExists(this.dbPath)) {
        await fs.remove(this.dbPath)
        console.log('数据库文件已删除')
      }

      // 重新初始化数据库
      await this.initialize()

      console.log('数据库重置完成')
      return { success: true, message: '数据库已完全重置' }
    } catch (error) {
      console.error('重置数据库失败:', error)
      throw new Error('重置数据库失败: ' + error.message)
    }
  }

  /**
   * 获取数据库统计信息
   */
  getDatabaseStats() {
    try {
      const stats = {}

      // 获取所有表名
      const stmt = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
      const tables = []
      while (stmt.step()) {
        const row = stmt.getAsObject()
        tables.push(row.name)
      }
      stmt.free()

      // 获取每个表的记录数
      for (const tableName of tables) {
        try {
          const countStmt = this.db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`)
          let result = null
          if (countStmt.step()) {
            result = countStmt.getAsObject()
          }
          countStmt.free()
          stats[tableName] = result ? result.count : 0
        } catch (error) {
          stats[tableName] = 'error'
        }
      }

      return stats
    } catch (error) {
      console.error('获取数据库统计信息失败:', error)
      return {}
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