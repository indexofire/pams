const initSqlJs = require('sql.js')
const path = require('path')
const fs = require('fs-extra')
const { app } = require('electron')
const bcrypt = require('bcryptjs')

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
        lastLogin TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // 菌株表
    this.db.run(`
      CREATE TABLE IF NOT EXISTS strains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        strainId TEXT UNIQUE NOT NULL,
        species TEXT NOT NULL,
        source TEXT,
        isolationDate TEXT,
        isolationSite TEXT,
        sampleType TEXT,
        patientId TEXT,
        patientAge INTEGER,
        patientGender TEXT,
        hospital TEXT,
        department TEXT,
        region TEXT,
        diagnosis TEXT,
        antibioticTreatment TEXT,
        outcome TEXT,
        createdBy INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `)

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

    console.log('数据库表结构创建完成')
  }

  async createDefaultData() {
    // 检查是否已存在管理员用户
    const stmt = this.db.prepare('SELECT id FROM users WHERE username = ?')
    const adminExists = stmt.get(['admin'])

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      const insertStmt = this.db.prepare(`
        INSERT INTO users (username, email, password, role)
        VALUES (?, ?, ?, ?)
      `)
      
      insertStmt.run(['admin', 'admin@pams.local', hashedPassword, 'admin'])
      
      console.log('默认管理员账户已创建: admin/admin123')
      
      // 保存数据库
      await this.saveDatabase()
    }
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
    const stmt = this.db.prepare('SELECT id, username, email, role, isActive, lastLogin, createdAt FROM users')
    return stmt.all()
  }

  getUserById(id) {
    const stmt = this.db.prepare('SELECT id, username, email, role, isActive, lastLogin, createdAt FROM users WHERE id = ?')
    return stmt.get([id])
  }

  getUserByUsername(username) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ?')
    return stmt.get([username])
  }

  async createUser(userData) {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password, role)
      VALUES (?, ?, ?, ?)
    `)
    stmt.run([userData.username, userData.email, userData.password, userData.role || 'user'])
    
    // 获取插入的ID
    const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
    const result = idStmt.get()
    
    await this.saveDatabase()
    return { id: result.id, ...userData }
  }

  // 菌株相关方法
  getAllStrains() {
    const stmt = this.db.prepare(`
      SELECT s.*, u.username as creatorName,
             COUNT(g.id) as genomeCount
      FROM strains s
      LEFT JOIN users u ON s.createdBy = u.id
      LEFT JOIN genomes g ON s.id = g.strainId
      GROUP BY s.id
      ORDER BY s.createdAt DESC
    `)
    return stmt.all()
  }

  getStrainById(id) {
    const stmt = this.db.prepare('SELECT * FROM strains WHERE id = ?')
    return stmt.get([id])
  }

  async createStrain(strainData) {
    const stmt = this.db.prepare(`
      INSERT INTO strains (
        strainId, species, source, isolationDate, isolationSite, sampleType,
        patientId, patientAge, patientGender, hospital, department, region,
        diagnosis, antibioticTreatment, outcome, createdBy
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run([
      strainData.strainId, strainData.species, strainData.source,
      strainData.isolationDate, strainData.isolationSite, strainData.sampleType,
      strainData.patientId, strainData.patientAge, strainData.patientGender,
      strainData.hospital, strainData.department, strainData.region,
      strainData.diagnosis, strainData.antibioticTreatment, strainData.outcome,
      strainData.createdBy
    ])
    
    // 获取插入的ID
    const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
    const result = idStmt.get()
    
    await this.saveDatabase()
    return { id: result.id, ...strainData }
  }

  async updateStrain(id, strainData) {
    const stmt = this.db.prepare(`
      UPDATE strains SET
        species = ?, source = ?, isolationDate = ?, isolationSite = ?,
        sampleType = ?, patientId = ?, patientAge = ?, patientGender = ?,
        hospital = ?, department = ?, region = ?, diagnosis = ?,
        antibioticTreatment = ?, outcome = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    
    stmt.run([
      strainData.species, strainData.source, strainData.isolationDate,
      strainData.isolationSite, strainData.sampleType, strainData.patientId,
      strainData.patientAge, strainData.patientGender, strainData.hospital,
      strainData.department, strainData.region, strainData.diagnosis,
      strainData.antibioticTreatment, strainData.outcome, id
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
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM strains')
    const result = stmt.get()
    return result.count
  }

  // 基因组相关方法
  getAllGenomes() {
    const stmt = this.db.prepare(`
      SELECT g.*, s.strainId, s.species
      FROM genomes g
      LEFT JOIN strains s ON g.strainId = s.id
      ORDER BY g.createdAt DESC
    `)
    return stmt.all()
  }

  getGenomeById(id) {
    const stmt = this.db.prepare('SELECT * FROM genomes WHERE id = ?')
    return stmt.get([id])
  }

  async createGenome(genomeData) {
    const stmt = this.db.prepare(`
      INSERT INTO genomes (
        filename, filepath, fileSize, fileHash, sequencingPlatform,
        sequencingDate, assemblyMethod, strainId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run([
      genomeData.filename, genomeData.filepath, genomeData.fileSize,
      genomeData.fileHash, genomeData.sequencingPlatform,
      genomeData.sequencingDate, genomeData.assemblyMethod,
      genomeData.strainId
    ])
    
    // 获取插入的ID
    const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
    const result = idStmt.get()
    
    await this.saveDatabase()
    return { id: result.id, ...genomeData }
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
    const stmt = this.db.prepare('SELECT COUNT(*) as count FROM genomes')
    const result = stmt.get()
    return result.count
  }

  // 分析任务相关方法
  getAllTasks() {
    const stmt = this.db.prepare(`
      SELECT t.*, u.username as creatorName,
             COUNT(tg.genomeId) as genomeCount
      FROM analysis_tasks t
      LEFT JOIN users u ON t.createdBy = u.id
      LEFT JOIN task_genomes tg ON t.id = tg.taskId
      GROUP BY t.id
      ORDER BY t.createdAt DESC
    `)
    return stmt.all()
  }

  async createTask(taskData) {
    const stmt = this.db.prepare(`
      INSERT INTO analysis_tasks (name, type, parameters, createdBy)
      VALUES (?, ?, ?, ?)
    `)
    
    stmt.run([
      taskData.name, taskData.type,
      JSON.stringify(taskData.parameters),
      taskData.createdBy
    ])
    
    // 获取插入的ID
    const idStmt = this.db.prepare('SELECT last_insert_rowid() as id')
    const result = idStmt.get()
    
    await this.saveDatabase()
    return { id: result.id, ...taskData }
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
    const stmt = this.db.prepare(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('pending', 'running') THEN 1 ELSE 0 END) as pending
      FROM analysis_tasks
    `)
    return stmt.get()
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