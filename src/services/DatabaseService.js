const { Sequelize, DataTypes } = require('sequelize')
const path = require('path')
const fs = require('fs-extra')
const { app } = require('electron')

class DatabaseService {
  constructor() {
    this.sequelize = null
    this.models = {}
  }

  async initialize() {
    // 确定数据库路径
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'pams.db')
    
    // 确保目录存在
    await fs.ensureDir(path.dirname(dbPath))

    // 初始化Sequelize
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: dbPath,
      logging: process.env.NODE_ENV === 'development' ? console.log : false
    })

    // 定义模型
    this.defineModels()

    // 同步数据库
    await this.sequelize.sync({ force: false })

    // 创建默认数据
    await this.createDefaultData()

    console.log('数据库连接成功:', dbPath)
  }

  defineModels() {
    // 用户模型
    this.models.User = this.sequelize.define('User', {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: DataTypes.DATE
      }
    })

    // 菌株模型
    this.models.Strain = this.sequelize.define('Strain', {
      strainId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      species: {
        type: DataTypes.STRING,
        allowNull: false
      },
      source: DataTypes.STRING,
      isolationDate: DataTypes.DATEONLY,
      isolationSite: DataTypes.STRING,
      sampleType: DataTypes.STRING,
      patientId: DataTypes.STRING,
      patientAge: DataTypes.INTEGER,
      patientGender: DataTypes.STRING,
      hospital: DataTypes.STRING,
      department: DataTypes.STRING,
      region: DataTypes.STRING,
      diagnosis: DataTypes.TEXT,
      antibioticTreatment: DataTypes.TEXT,
      outcome: DataTypes.STRING,
      createdBy: {
        type: DataTypes.INTEGER,
        references: {
          model: this.models.User,
          key: 'id'
        }
      }
    })

    // 基因组模型
    this.models.Genome = this.sequelize.define('Genome', {
      filename: {
        type: DataTypes.STRING,
        allowNull: false
      },
      filepath: {
        type: DataTypes.STRING,
        allowNull: false
      },
      fileSize: DataTypes.INTEGER,
      fileHash: DataTypes.STRING,
      sequencingPlatform: DataTypes.STRING,
      sequencingDate: DataTypes.DATEONLY,
      assemblyMethod: DataTypes.STRING,
      totalLength: DataTypes.INTEGER,
      contigCount: DataTypes.INTEGER,
      n50: DataTypes.INTEGER,
      gcContent: DataTypes.FLOAT,
      coverage: DataTypes.FLOAT,
      geneCount: DataTypes.INTEGER,
      codingSequences: DataTypes.INTEGER,
      rrnaCount: DataTypes.INTEGER,
      trnaCount: DataTypes.INTEGER,
      mlstSt: DataTypes.STRING,
      serotype: DataTypes.STRING,
      virulenceGenes: DataTypes.TEXT,
      resistanceGenes: DataTypes.TEXT,
      plasmids: DataTypes.TEXT,
      strainId: {
        type: DataTypes.INTEGER,
        references: {
          model: this.models.Strain,
          key: 'id'
        }
      }
    })

    // 分析任务模型
    this.models.AnalysisTask = this.sequelize.define('AnalysisTask', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: 'pending'
      },
      progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      parameters: DataTypes.TEXT,
      results: DataTypes.TEXT,
      errorMessage: DataTypes.TEXT,
      startedAt: DataTypes.DATE,
      completedAt: DataTypes.DATE,
      createdBy: {
        type: DataTypes.INTEGER,
        references: {
          model: this.models.User,
          key: 'id'
        }
      }
    })

    // 任务-基因组关联表
    this.models.TaskGenome = this.sequelize.define('TaskGenome', {
      taskId: {
        type: DataTypes.INTEGER,
        references: {
          model: this.models.AnalysisTask,
          key: 'id'
        }
      },
      genomeId: {
        type: DataTypes.INTEGER,
        references: {
          model: this.models.Genome,
          key: 'id'
        }
      }
    })

    // 定义关联关系
    this.models.User.hasMany(this.models.Strain, { foreignKey: 'createdBy' })
    this.models.Strain.belongsTo(this.models.User, { foreignKey: 'createdBy' })

    this.models.Strain.hasMany(this.models.Genome, { foreignKey: 'strainId' })
    this.models.Genome.belongsTo(this.models.Strain, { foreignKey: 'strainId' })

    this.models.User.hasMany(this.models.AnalysisTask, { foreignKey: 'createdBy' })
    this.models.AnalysisTask.belongsTo(this.models.User, { foreignKey: 'createdBy' })

    this.models.AnalysisTask.belongsToMany(this.models.Genome, { 
      through: this.models.TaskGenome,
      foreignKey: 'taskId'
    })
    this.models.Genome.belongsToMany(this.models.AnalysisTask, { 
      through: this.models.TaskGenome,
      foreignKey: 'genomeId'
    })
  }

  async createDefaultData() {
    // 创建默认管理员用户
    const adminExists = await this.models.User.findOne({ where: { username: 'admin' } })
    if (!adminExists) {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash('admin123', 10)
      
      await this.models.User.create({
        username: 'admin',
        email: 'admin@pams.local',
        password: hashedPassword,
        role: 'admin'
      })
      
      console.log('默认管理员账户已创建: admin/admin123')
    }
  }

  getModel(modelName) {
    return this.models[modelName]
  }

  async close() {
    if (this.sequelize) {
      await this.sequelize.close()
      console.log('数据库连接已关闭')
    }
  }
}

module.exports = DatabaseService 