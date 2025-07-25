#!/usr/bin/env node

/**
 * PAMS 菌株数据命令行导入工具
 * 
 * 用法:
 *   node cli/import-strains.js <csv-file> [options]
 * 
 * 选项:
 *   --batch-size <size>     批处理大小 (默认: 1000)
 *   --dry-run              只验证数据，不实际导入
 *   --skip-duplicates      跳过重复的菌株编号
 *   --force                强制覆盖重复的菌株编号
 *   --mapping <file>       字段映射配置文件
 *   --help                 显示帮助信息
 * 
 * 示例:
 *   node cli/import-strains.js data/strains.csv
 *   node cli/import-strains.js data/strains.csv --batch-size 500 --skip-duplicates
 *   node cli/import-strains.js data/strains.csv --dry-run
 */

const fs = require('fs-extra')
const path = require('path')
const csv = require('csv-parser')
const { program } = require('commander')
const chalk = require('chalk')
const ProgressBar = require('progress')

// 导入服务
const DatabaseService = require('../src/services/DatabaseService')
const StrainService = require('../src/services/StrainService')

class StrainImporter {
  constructor(options = {}) {
    this.options = {
      batchSize: 1000,
      dryRun: false,
      skipDuplicates: false,
      force: false,
      mapping: null,
      ...options
    }
    
    this.stats = {
      total: 0,
      processed: 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: []
    }
    
    this.progressBar = null
    this.db = null
    this.strainService = null
  }

  /**
   * 初始化数据库连接
   */
  async initialize() {
    try {
      console.log(chalk.blue('🔧 初始化数据库连接...'))

      // 设置CLI环境标志
      process.env.CLI_MODE = 'true'

      // 初始化数据库服务
      this.db = new DatabaseService()
      await this.db.initialize()

      // 初始化菌株服务
      this.strainService = new StrainService(this.db)

      console.log(chalk.green('✅ 数据库连接成功'))
    } catch (error) {
      console.error(chalk.red('❌ 数据库初始化失败:'), error.message)
      process.exit(1)
    }
  }

  /**
   * 读取CSV文件
   */
  async readCSV(filePath) {
    return new Promise((resolve, reject) => {
      const records = []
      const errors = []
      
      console.log(chalk.blue(`📖 读取CSV文件: ${filePath}`))
      
      if (!fs.existsSync(filePath)) {
        reject(new Error(`文件不存在: ${filePath}`))
        return
      }
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          records.push(data)
        })
        .on('error', (error) => {
          errors.push(error)
        })
        .on('end', () => {
          if (errors.length > 0) {
            reject(new Error(`CSV读取错误: ${errors.map(e => e.message).join(', ')}`))
          } else {
            console.log(chalk.green(`✅ 成功读取 ${records.length} 条记录`))
            resolve(records)
          }
        })
    })
  }

  /**
   * 加载字段映射配置
   */
  async loadMapping(mappingFile) {
    if (!mappingFile) {
      return this.getDefaultMapping()
    }
    
    try {
      const mappingPath = path.resolve(mappingFile)
      if (!fs.existsSync(mappingPath)) {
        throw new Error(`映射文件不存在: ${mappingPath}`)
      }
      
      const mapping = await fs.readJson(mappingPath)
      console.log(chalk.blue('📋 使用自定义字段映射'))
      return mapping
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  加载映射文件失败，使用默认映射: ${error.message}`))
      return this.getDefaultMapping()
    }
  }

  /**
   * 获取默认字段映射
   */
  getDefaultMapping() {
    return {
      strain_id: ['菌株编号', 'strain_id', 'strainid', '编号'],
      species: ['菌种(属)', '菌种类型', '菌种', 'species', '种类'],
      sample_id: ['样本编号', 'sample_id', 'sampleid', '样本号'],
      sample_source: ['样本', '样本来源', 'sample_source', '来源', '源'],
      region: ['地区', '采集地区', 'region', '地点', '位置'],
      project_source: ['来源', '项目来源', 'project_source', '项目'],
      experiment_type: ['实验类型', 'experiment_type', '实验', '类型'],
      st_type: ['ST型', 'st_type', 'st', 'ST'],
      serotype: ['血清型', 'serotype', '血清'],
      virulence_genes: ['毒力基因', 'virulence_genes', '毒力'],
      antibiotic_resistance: ['耐药谱', 'antibiotic_resistance', '耐药', '抗药性'],
      molecular_serotype: ['分子血清型', 'molecular_serotype', '分子血清']
    }
  }

  /**
   * 映射CSV字段到数据库字段
   */
  mapFields(record, mapping) {
    const mapped = {}
    const csvFields = Object.keys(record)
    
    for (const [dbField, csvFieldOptions] of Object.entries(mapping)) {
      for (const csvField of csvFields) {
        const normalizedCsvField = csvField.toLowerCase().trim()
        const matchFound = csvFieldOptions.some(option => 
          normalizedCsvField === option.toLowerCase() ||
          normalizedCsvField.includes(option.toLowerCase()) ||
          option.toLowerCase().includes(normalizedCsvField)
        )
        
        if (matchFound && record[csvField]) {
          mapped[dbField] = record[csvField].toString().trim()
          break
        }
      }
    }
    
    return mapped
  }

  /**
   * 验证菌株数据
   */
  validateRecord(record) {
    const errors = []
    
    // 必填字段检查
    if (!record.strain_id) {
      errors.push('缺少菌株编号')
    }
    
    if (!record.species) {
      errors.push('缺少菌种信息')
    }
    
    if (!record.region) {
      errors.push('缺少地区信息')
    }
    
    // 字段长度检查
    if (record.strain_id && record.strain_id.length > 100) {
      errors.push('菌株编号过长')
    }
    
    if (record.species && record.species.length > 100) {
      errors.push('菌种名称过长')
    }
    
    return errors
  }

  /**
   * 检查重复菌株
   */
  async checkDuplicates(records) {
    console.log(chalk.blue('🔍 检查重复菌株...'))
    
    const existingStrains = await this.strainService.getAllStrains()
    const existingIds = new Set(existingStrains.map(s => s.strain_id))
    
    const duplicates = []
    const unique = []
    
    for (const record of records) {
      if (existingIds.has(record.strain_id)) {
        duplicates.push(record)
      } else {
        unique.push(record)
      }
    }
    
    if (duplicates.length > 0) {
      console.log(chalk.yellow(`⚠️  发现 ${duplicates.length} 条重复记录`))
      
      if (this.options.skipDuplicates) {
        console.log(chalk.blue('📋 跳过重复记录'))
        return unique
      } else if (this.options.force) {
        console.log(chalk.red('🔄 强制覆盖重复记录'))
        return records
      } else {
        console.log(chalk.red('❌ 存在重复记录，请使用 --skip-duplicates 或 --force 选项'))
        process.exit(1)
      }
    }
    
    return records
  }

  /**
   * 批量导入菌株
   */
  async importBatch(records) {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }
    
    for (const record of records) {
      try {
        if (this.options.dryRun) {
          // 干运行模式，只验证不导入
          const errors = this.validateRecord(record)
          if (errors.length > 0) {
            results.failed++
            results.errors.push({
              record: record.strain_id || 'unknown',
              errors
            })
          } else {
            results.success++
          }
        } else {
          // 实际导入
          if (this.options.force && record.strain_id) {
            // 如果是强制模式，先删除已存在的记录
            try {
              await this.strainService.deleteStrainByStrainId(record.strain_id)
            } catch (error) {
              // 忽略删除错误，可能记录不存在
            }
          }
          
          await this.strainService.createStrain(record)
          results.success++
        }
        
        this.stats.processed++
        if (this.progressBar) {
          this.progressBar.tick()
        }
        
      } catch (error) {
        results.failed++
        results.errors.push({
          record: record.strain_id || 'unknown',
          error: error.message
        })
        
        this.stats.processed++
        if (this.progressBar) {
          this.progressBar.tick()
        }
      }
    }
    
    return results
  }

  /**
   * 执行导入
   */
  async import(filePath) {
    try {
      // 读取CSV文件
      const rawRecords = await this.readCSV(filePath)
      this.stats.total = rawRecords.length
      
      if (rawRecords.length === 0) {
        console.log(chalk.yellow('⚠️  CSV文件为空'))
        return
      }
      
      // 加载字段映射
      const mapping = await this.loadMapping(this.options.mapping)
      
      // 映射字段
      console.log(chalk.blue('🔄 映射字段...'))
      const mappedRecords = rawRecords.map(record => this.mapFields(record, mapping))
      
      // 验证数据
      console.log(chalk.blue('✅ 验证数据...'))
      const validRecords = []
      const invalidRecords = []
      
      for (const record of mappedRecords) {
        const errors = this.validateRecord(record)
        if (errors.length === 0) {
          validRecords.push(record)
        } else {
          invalidRecords.push({ record, errors })
        }
      }
      
      if (invalidRecords.length > 0) {
        console.log(chalk.red(`❌ 发现 ${invalidRecords.length} 条无效记录:`))
        invalidRecords.slice(0, 5).forEach(({ record, errors }) => {
          console.log(chalk.red(`  - ${record.strain_id || 'unknown'}: ${errors.join(', ')}`))
        })
        
        if (invalidRecords.length > 5) {
          console.log(chalk.red(`  ... 还有 ${invalidRecords.length - 5} 条错误记录`))
        }
        
        if (!this.options.force) {
          console.log(chalk.red('❌ 请修复数据错误后重试，或使用 --force 选项忽略错误'))
          process.exit(1)
        }
      }
      
      console.log(chalk.green(`✅ 有效记录: ${validRecords.length} 条`))
      
      if (validRecords.length === 0) {
        console.log(chalk.yellow('⚠️  没有有效记录可导入'))
        return
      }
      
      // 检查重复
      const recordsToImport = await this.checkDuplicates(validRecords)
      
      if (recordsToImport.length === 0) {
        console.log(chalk.yellow('⚠️  没有记录需要导入'))
        return
      }
      
      // 初始化进度条
      const action = this.options.dryRun ? '验证' : '导入'
      this.progressBar = new ProgressBar(
        `${action}中 [:bar] :current/:total (:percent) :etas`,
        {
          complete: '█',
          incomplete: '░',
          width: 40,
          total: recordsToImport.length
        }
      )
      
      // 分批处理
      console.log(chalk.blue(`🚀 开始${action}，批大小: ${this.options.batchSize}`))
      
      for (let i = 0; i < recordsToImport.length; i += this.options.batchSize) {
        const batch = recordsToImport.slice(i, i + this.options.batchSize)
        const result = await this.importBatch(batch)
        
        this.stats.success += result.success
        this.stats.failed += result.failed
        this.stats.errors.push(...result.errors)
        
        // 短暂延迟，避免数据库压力过大
        if (i + this.options.batchSize < recordsToImport.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
      
      // 显示结果
      this.showResults()
      
    } catch (error) {
      console.error(chalk.red('❌ 导入失败:'), error.message)
      process.exit(1)
    }
  }

  /**
   * 显示导入结果
   */
  showResults() {
    console.log('\n' + chalk.bold('📊 导入结果统计:'))
    console.log(chalk.blue(`总记录数: ${this.stats.total}`))
    console.log(chalk.green(`成功: ${this.stats.success}`))
    console.log(chalk.red(`失败: ${this.stats.failed}`))
    console.log(chalk.yellow(`跳过: ${this.stats.skipped}`))
    
    if (this.stats.errors.length > 0) {
      console.log('\n' + chalk.red('❌ 错误详情:'))
      this.stats.errors.slice(0, 10).forEach(error => {
        if (error.errors) {
          console.log(chalk.red(`  - ${error.record}: ${error.errors.join(', ')}`))
        } else {
          console.log(chalk.red(`  - ${error.record}: ${error.error}`))
        }
      })
      
      if (this.stats.errors.length > 10) {
        console.log(chalk.red(`  ... 还有 ${this.stats.errors.length - 10} 个错误`))
      }
    }
    
    if (this.options.dryRun) {
      console.log('\n' + chalk.blue('ℹ️  这是干运行模式，没有实际导入数据'))
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.db) {
      await this.db.close()
    }
  }
}

// 主函数
async function main() {
  program
    .name('import-strains')
    .description('PAMS 菌株数据命令行导入工具')
    .version('1.0.0')
    .argument('<csv-file>', 'CSV文件路径')
    .option('-b, --batch-size <size>', '批处理大小', '1000')
    .option('-d, --dry-run', '只验证数据，不实际导入')
    .option('-s, --skip-duplicates', '跳过重复的菌株编号')
    .option('-f, --force', '强制覆盖重复的菌株编号')
    .option('-m, --mapping <file>', '字段映射配置文件')
    .option('-v, --verbose', '显示详细信息')

  program.parse()

  const csvFile = program.args[0]
  const options = program.opts()

  // 转换选项
  const importerOptions = {
    batchSize: parseInt(options.batchSize),
    dryRun: options.dryRun,
    skipDuplicates: options.skipDuplicates,
    force: options.force,
    mapping: options.mapping,
    verbose: options.verbose
  }

  console.log(chalk.bold.blue('🧬 PAMS 菌株数据导入工具\n'))

  const importer = new StrainImporter(importerOptions)

  try {
    await importer.initialize()
    await importer.import(csvFile)
  } catch (error) {
    console.error(chalk.red('❌ 程序执行失败:'), error.message)
    process.exit(1)
  } finally {
    await importer.cleanup()
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ 未处理的Promise拒绝:'), reason)
  process.exit(1)
})

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ 未捕获的异常:'), error)
  process.exit(1)
})

// 处理中断信号
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n⚠️  收到中断信号，正在清理...'))
  process.exit(0)
})

if (require.main === module) {
  main()
}

module.exports = StrainImporter
