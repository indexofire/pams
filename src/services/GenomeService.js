const path = require('path')
const fs = require('fs-extra')
const crypto = require('crypto')
const { app } = require('electron')

class GenomeService {
  constructor(databaseService) {
    this.db = databaseService
    this.dataPath = path.join(app.getPath('userData'), 'genomes')
    this.ensureDataDirectory()
  }

  /**
   * 确保数据目录存在
   */
  async ensureDataDirectory() {
    try {
      await fs.ensureDir(this.dataPath)
    } catch (error) {
      console.error('创建基因组数据目录失败:', error)
    }
  }

  /**
   * 获取所有基因组
   */
  async getAllGenomes() {
    try {
      return this.db.getAllGenomes()
    } catch (error) {
      console.error('获取基因组列表失败:', error)
      throw new Error('获取基因组列表失败')
    }
  }

  /**
   * 根据ID获取基因组
   */
  async getGenomeById(id) {
    try {
      return this.db.getGenomeById(id)
    } catch (error) {
      console.error('获取基因组详情失败:', error)
      throw new Error('获取基因组详情失败')
    }
  }

  /**
   * 上传基因组文件
   */
  async uploadGenome(filePath, metadata) {
    try {
      // 验证文件
      await this.validateGenomeFile(filePath)
      
      // 生成唯一文件名
      const fileHash = await this.calculateFileHash(filePath)
      const fileExtension = path.extname(filePath)
      const newFileName = `${fileHash}${fileExtension}`
      const newFilePath = path.join(this.dataPath, newFileName)
      
      // 检查文件是否已存在
      const existingGenomes = this.db.getAllGenomes()
      const fileExists = existingGenomes.some(genome => genome.file_hash === fileHash)
      
      if (fileExists) {
        throw new Error('基因组文件已存在')
      }

      // 复制文件到数据目录
      await fs.copy(filePath, newFilePath)
      
      // 分析文件获取基本信息
      const fileStats = await this.analyzeGenomeFile(newFilePath)
      
      // 准备基因组数据
      const genomeData = {
        ...metadata,
        file_path: newFilePath,
        file_hash: fileHash,
        file_size: fileStats.size,
        sequence_count: fileStats.sequenceCount,
        total_length: fileStats.totalLength,
        gc_content: fileStats.gcContent,
        upload_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // 保存到数据库
      return await this.db.createGenome(genomeData)
    } catch (error) {
      console.error('上传基因组失败:', error)
      throw error
    }
  }

  /**
   * 更新基因组信息
   */
  async updateGenome(id, genomeData) {
    try {
      // 检查基因组是否存在
      const existingGenome = this.db.getGenomeById(id)
      if (!existingGenome) {
        throw new Error('基因组不存在')
      }

      // 添加更新时间
      const genomeWithTimestamp = {
        ...genomeData,
        updated_at: new Date().toISOString()
      }

      return await this.db.updateGenome(id, genomeWithTimestamp)
    } catch (error) {
      console.error('更新基因组失败:', error)
      throw error
    }
  }

  /**
   * 删除基因组
   */
  async deleteGenome(id) {
    try {
      // 检查基因组是否存在
      const existingGenome = this.db.getGenomeById(id)
      if (!existingGenome) {
        throw new Error('基因组不存在')
      }

      // 检查是否有关联的分析任务
      const tasks = this.db.getAllTasks()
      const hasAnalysis = tasks.some(task => 
        task.genome_ids && task.genome_ids.includes(parseInt(id))
      )
      
      if (hasAnalysis) {
        throw new Error('无法删除基因组：存在关联的分析任务')
      }

      // 删除文件
      if (existingGenome.file_path && await fs.pathExists(existingGenome.file_path)) {
        await fs.remove(existingGenome.file_path)
      }

      // 从数据库删除
      return await this.db.deleteGenome(id)
    } catch (error) {
      console.error('删除基因组失败:', error)
      throw error
    }
  }

  /**
   * 根据条件搜索基因组
   */
  async searchGenomes(criteria) {
    try {
      const allGenomes = this.db.getAllGenomes()
      
      let filteredGenomes = allGenomes

      // 按名称过滤
      if (criteria.name) {
        filteredGenomes = filteredGenomes.filter(genome =>
          genome.name.toLowerCase().includes(criteria.name.toLowerCase())
        )
      }

      // 按物种过滤
      if (criteria.species) {
        filteredGenomes = filteredGenomes.filter(genome =>
          genome.species && genome.species.toLowerCase().includes(criteria.species.toLowerCase())
        )
      }

      // 按数据类型过滤
      if (criteria.dataType) {
        filteredGenomes = filteredGenomes.filter(genome =>
          genome.data_type === criteria.dataType
        )
      }

      // 按菌株ID过滤
      if (criteria.strainId) {
        filteredGenomes = filteredGenomes.filter(genome =>
          genome.strain_id === parseInt(criteria.strainId)
        )
      }

      // 按日期范围过滤
      if (criteria.startDate || criteria.endDate) {
        filteredGenomes = filteredGenomes.filter(genome => {
          const uploadDate = new Date(genome.upload_date || genome.created_at)
          if (criteria.startDate && uploadDate < new Date(criteria.startDate)) {
            return false
          }
          if (criteria.endDate && uploadDate > new Date(criteria.endDate)) {
            return false
          }
          return true
        })
      }

      return filteredGenomes
    } catch (error) {
      console.error('搜索基因组失败:', error)
      throw new Error('搜索基因组失败')
    }
  }

  /**
   * 获取基因组总数
   */
  async getGenomeCount() {
    try {
      return this.db.getGenomeCount()
    } catch (error) {
      console.error('获取基因组数量失败:', error)
      throw new Error('获取基因组数量失败')
    }
  }

  /**
   * 获取基因组统计信息
   */
  async getGenomeStats() {
    try {
      const allGenomes = this.db.getAllGenomes()
      
      const stats = {
        total: allGenomes.length,
        totalSize: 0,
        bySpecies: {},
        byDataType: {},
        recentCount: 0,
        avgGenomeSize: 0,
        avgGcContent: 0
      }

      // 计算总大小和平均值
      let totalLength = 0
      let totalGcContent = 0
      let validGcCount = 0

      allGenomes.forEach(genome => {
        // 总文件大小
        stats.totalSize += genome.file_size || 0
        
        // 总基因组长度
        totalLength += genome.total_length || 0
        
        // GC含量
        if (genome.gc_content) {
          totalGcContent += genome.gc_content
          validGcCount++
        }

        // 按物种统计
        const species = genome.species || 'Unknown'
        stats.bySpecies[species] = (stats.bySpecies[species] || 0) + 1

        // 按数据类型统计
        const dataType = genome.data_type || 'Unknown'
        stats.byDataType[dataType] = (stats.byDataType[dataType] || 0) + 1
      })

      // 计算平均值
      if (allGenomes.length > 0) {
        stats.avgGenomeSize = Math.round(totalLength / allGenomes.length)
      }
      if (validGcCount > 0) {
        stats.avgGcContent = Math.round((totalGcContent / validGcCount) * 100) / 100
      }

      // 统计最近30天的基因组数量
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      stats.recentCount = allGenomes.filter(genome => {
        const uploadDate = new Date(genome.upload_date || genome.created_at)
        return uploadDate >= thirtyDaysAgo
      }).length

      return stats
    } catch (error) {
      console.error('获取基因组统计失败:', error)
      throw new Error('获取基因组统计失败')
    }
  }

  /**
   * 获取最近的基因组记录
   */
  async getRecentGenomes(limit = 10) {
    try {
      const allGenomes = this.db.getAllGenomes()

      // 按创建时间排序，返回最新的记录
      return allGenomes
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit)
    } catch (error) {
      console.error('获取最近基因组记录失败:', error)
      throw new Error('获取最近基因组记录失败')
    }
  }

  /**
   * 验证基因组文件
   */
  async validateGenomeFile(filePath) {
    if (!await fs.pathExists(filePath)) {
      throw new Error('文件不存在')
    }

    const stats = await fs.stat(filePath)
    if (stats.size === 0) {
      throw new Error('文件为空')
    }

    // 检查文件大小（限制为500MB）
    const maxSize = 500 * 1024 * 1024
    if (stats.size > maxSize) {
      throw new Error('文件大小超过限制（500MB）')
    }

    // 检查文件扩展名
    const ext = path.extname(filePath).toLowerCase()
    const validExtensions = ['.fasta', '.fa', '.fna', '.fas', '.seq', '.txt']
    if (!validExtensions.includes(ext)) {
      throw new Error('不支持的文件格式')
    }

    return true
  }

  /**
   * 计算文件哈希值
   */
  async calculateFileHash(filePath) {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)
    
    return new Promise((resolve, reject) => {
      stream.on('data', (data) => hash.update(data))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }

  /**
   * 分析基因组文件
   */
  async analyzeGenomeFile(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8')
      
      // 解析FASTA格式
      const lines = content.split('\n')
      let sequenceCount = 0
      let totalLength = 0
      let gcCount = 0
      let atCount = 0
      
      let currentSequence = ''
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        
        if (trimmedLine.startsWith('>')) {
          // 处理前一个序列
          if (currentSequence) {
            totalLength += currentSequence.length
            gcCount += (currentSequence.match(/[GC]/gi) || []).length
            atCount += (currentSequence.match(/[AT]/gi) || []).length
          }
          
          sequenceCount++
          currentSequence = ''
        } else if (trimmedLine && !trimmedLine.startsWith(';')) {
          currentSequence += trimmedLine.toUpperCase()
        }
      }
      
      // 处理最后一个序列
      if (currentSequence) {
        totalLength += currentSequence.length
        gcCount += (currentSequence.match(/[GC]/gi) || []).length
        atCount += (currentSequence.match(/[AT]/gi) || []).length
      }
      
      const gcContent = totalLength > 0 ? (gcCount / (gcCount + atCount)) * 100 : 0
      
      const stats = await fs.stat(filePath)
      
      return {
        size: stats.size,
        sequenceCount,
        totalLength,
        gcContent: Math.round(gcContent * 100) / 100
      }
    } catch (error) {
      console.error('分析基因组文件失败:', error)
      return {
        size: 0,
        sequenceCount: 0,
        totalLength: 0,
        gcContent: 0
      }
    }
  }

  /**
   * 批量导入基因组
   */
  async importGenomes(genomeFiles) {
    try {
      const results = {
        success: 0,
        failed: 0,
        errors: []
      }

      for (const fileData of genomeFiles) {
        try {
          await this.uploadGenome(fileData.filePath, fileData.metadata)
          results.success++
        } catch (error) {
          results.failed++
          results.errors.push({
            file: fileData.metadata.name || fileData.filePath,
            error: error.message
          })
        }
      }

      return results
    } catch (error) {
      console.error('批量导入基因组失败:', error)
      throw new Error('批量导入基因组失败')
    }
  }

  /**
   * 导出基因组文件
   */
  async exportGenome(id, targetPath) {
    try {
      const genome = this.db.getGenomeById(id)
      if (!genome) {
        throw new Error('基因组不存在')
      }

      if (!await fs.pathExists(genome.file_path)) {
        throw new Error('基因组文件不存在')
      }

      await fs.copy(genome.file_path, targetPath)
      return true
    } catch (error) {
      console.error('导出基因组失败:', error)
      throw error
    }
  }
}

module.exports = GenomeService 