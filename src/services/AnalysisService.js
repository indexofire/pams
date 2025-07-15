const path = require('path')
const fs = require('fs-extra')
const { spawn } = require('child_process')
const { app } = require('electron')
const EventEmitter = require('events')

class AnalysisService extends EventEmitter {
  constructor(databaseService) {
    super()
    this.db = databaseService
    this.outputPath = path.join(app.getPath('userData'), 'analysis_results')
    this.runningTasks = new Map()
    this.ensureOutputDirectory()
  }

  /**
   * 确保输出目录存在
   */
  async ensureOutputDirectory() {
    try {
      await fs.ensureDir(this.outputPath)
    } catch (error) {
      console.error('创建分析结果目录失败:', error)
    }
  }

  /**
   * 获取所有分析任务
   */
  async getAllTasks() {
    try {
      return this.db.getAllTasks()
    } catch (error) {
      console.error('获取分析任务列表失败:', error)
      throw new Error('获取分析任务列表失败')
    }
  }

  /**
   * 根据ID获取分析任务
   */
  async getTaskById(id) {
    try {
      const tasks = this.db.getAllTasks()
      return tasks.find(task => task.id === parseInt(id))
    } catch (error) {
      console.error('获取分析任务详情失败:', error)
      throw new Error('获取分析任务详情失败')
    }
  }

  /**
   * 开始分析任务
   */
  async startAnalysis(analysisType, genomeIds, params) {
    try {
      // 验证参数
      this.validateAnalysisParams(analysisType, genomeIds, params)
      
      // 检查基因组是否存在
      const genomes = this.db.getAllGenomes()
      const validGenomeIds = genomeIds.filter(id => 
        genomes.some(genome => genome.id === parseInt(id))
      )
      
      if (validGenomeIds.length === 0) {
        throw new Error('没有找到有效的基因组')
      }

      // 创建任务
      const taskData = {
        type: analysisType,
        genome_ids: validGenomeIds,
        parameters: JSON.stringify(params),
        status: 'pending',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const task = await this.db.createTask(taskData)
      
      // 异步执行分析
      this.executeAnalysis(task)
      
      return task
    } catch (error) {
      console.error('启动分析任务失败:', error)
      throw error
    }
  }

  /**
   * 执行分析任务
   */
  async executeAnalysis(task) {
    try {
      console.log(`开始执行分析任务: ${task.id} (${task.type})`)
      
      // 更新任务状态
      await this.updateTaskStatus(task.id, 'running', 10)
      
      // 创建任务专用目录
      const taskOutputDir = path.join(this.outputPath, `task_${task.id}`)
      await fs.ensureDir(taskOutputDir)
      
      // 根据分析类型执行不同的分析
      let results
      switch (task.type) {
        case 'annotation':
          results = await this.executeAnnotation(task, taskOutputDir)
          break
        case 'mlst':
          results = await this.executeMLST(task, taskOutputDir)
          break
        case 'resistance':
          results = await this.executeResistanceAnalysis(task, taskOutputDir)
          break
        case 'virulence':
          results = await this.executeVirulenceAnalysis(task, taskOutputDir)
          break
        case 'phylogeny':
          results = await this.executePhylogenyAnalysis(task, taskOutputDir)
          break
        default:
          throw new Error(`不支持的分析类型: ${task.type}`)
      }
      
      // 更新任务完成状态
      await this.updateTaskStatus(task.id, 'completed', 100, results)
      
      console.log(`分析任务完成: ${task.id}`)
      this.emit('taskCompleted', task.id, results)
      
    } catch (error) {
      console.error(`分析任务失败: ${task.id}`, error)
      await this.updateTaskStatus(task.id, 'failed', 0, null, error.message)
      this.emit('taskFailed', task.id, error.message)
    } finally {
      this.runningTasks.delete(task.id)
    }
  }

  /**
   * 执行基因组注释分析
   */
  async executeAnnotation(task, outputDir) {
    // 模拟基因组注释过程
    const genomes = this.db.getAllGenomes()
    const targetGenomes = genomes.filter(g => task.genome_ids.includes(g.id))
    
    const results = {
      type: 'annotation',
      genomes: targetGenomes.length,
      genes_predicted: 0,
      proteins_annotated: 0,
      output_files: []
    }
    
    for (let i = 0; i < targetGenomes.length; i++) {
      const genome = targetGenomes[i]
      
      // 更新进度
      const progress = 10 + Math.round((i + 1) / targetGenomes.length * 80)
      await this.updateTaskStatus(task.id, 'running', progress)
      
      // 模拟注释过程
      await this.sleep(2000) // 模拟处理时间
      
      // 生成模拟结果
      const geneCount = Math.floor(Math.random() * 1000) + 3000
      const proteinCount = Math.floor(geneCount * 0.85)
      
      results.genes_predicted += geneCount
      results.proteins_annotated += proteinCount
      
      // 创建模拟输出文件
      const outputFile = path.join(outputDir, `${genome.name}_annotation.gff`)
      await this.generateMockAnnotationFile(outputFile, geneCount)
      results.output_files.push(outputFile)
    }
    
    return results
  }

  /**
   * 执行MLST分析
   */
  async executeMLST(task, outputDir) {
    const genomes = this.db.getAllGenomes()
    const targetGenomes = genomes.filter(g => task.genome_ids.includes(g.id))
    
    const results = {
      type: 'mlst',
      genomes: targetGenomes.length,
      sequence_types: [],
      output_files: []
    }
    
    const mockSTs = ['ST-131', 'ST-73', 'ST-95', 'ST-69', 'ST-127']
    
    for (let i = 0; i < targetGenomes.length; i++) {
      const genome = targetGenomes[i]
      
      const progress = 10 + Math.round((i + 1) / targetGenomes.length * 80)
      await this.updateTaskStatus(task.id, 'running', progress)
      
      await this.sleep(1500)
      
      const st = mockSTs[Math.floor(Math.random() * mockSTs.length)]
      results.sequence_types.push({
        genome: genome.name,
        sequence_type: st,
        alleles: this.generateMockAlleles()
      })
      
      const outputFile = path.join(outputDir, `${genome.name}_mlst.txt`)
      await this.generateMockMLSTFile(outputFile, st)
      results.output_files.push(outputFile)
    }
    
    return results
  }

  /**
   * 执行耐药基因分析
   */
  async executeResistanceAnalysis(task, outputDir) {
    const genomes = this.db.getAllGenomes()
    const targetGenomes = genomes.filter(g => task.genome_ids.includes(g.id))
    
    const results = {
      type: 'resistance',
      genomes: targetGenomes.length,
      resistance_genes: [],
      output_files: []
    }
    
    const mockGenes = ['blaTEM-1', 'aac(3)-IIa', 'qnrS1', 'tet(A)', 'catA1']
    
    for (let i = 0; i < targetGenomes.length; i++) {
      const genome = targetGenomes[i]
      
      const progress = 10 + Math.round((i + 1) / targetGenomes.length * 80)
      await this.updateTaskStatus(task.id, 'running', progress)
      
      await this.sleep(2000)
      
      const geneCount = Math.floor(Math.random() * 3) + 1
      const genes = []
      for (let j = 0; j < geneCount; j++) {
        genes.push(mockGenes[Math.floor(Math.random() * mockGenes.length)])
      }
      
      results.resistance_genes.push({
        genome: genome.name,
        genes: genes
      })
      
      const outputFile = path.join(outputDir, `${genome.name}_resistance.txt`)
      await this.generateMockResistanceFile(outputFile, genes)
      results.output_files.push(outputFile)
    }
    
    return results
  }

  /**
   * 执行毒力基因分析
   */
  async executeVirulenceAnalysis(task, outputDir) {
    const genomes = this.db.getAllGenomes()
    const targetGenomes = genomes.filter(g => task.genome_ids.includes(g.id))
    
    const results = {
      type: 'virulence',
      genomes: targetGenomes.length,
      virulence_genes: [],
      output_files: []
    }
    
    const mockGenes = ['fimH', 'stx1', 'stx2', 'eae', 'hla', 'hlb']
    
    for (let i = 0; i < targetGenomes.length; i++) {
      const genome = targetGenomes[i]
      
      const progress = 10 + Math.round((i + 1) / targetGenomes.length * 80)
      await this.updateTaskStatus(task.id, 'running', progress)
      
      await this.sleep(1800)
      
      const geneCount = Math.floor(Math.random() * 4) + 1
      const genes = []
      for (let j = 0; j < geneCount; j++) {
        genes.push(mockGenes[Math.floor(Math.random() * mockGenes.length)])
      }
      
      results.virulence_genes.push({
        genome: genome.name,
        genes: genes
      })
      
      const outputFile = path.join(outputDir, `${genome.name}_virulence.txt`)
      await this.generateMockVirulenceFile(outputFile, genes)
      results.output_files.push(outputFile)
    }
    
    return results
  }

  /**
   * 执行系统发育分析
   */
  async executePhylogenyAnalysis(task, outputDir) {
    const genomes = this.db.getAllGenomes()
    const targetGenomes = genomes.filter(g => task.genome_ids.includes(g.id))
    
    if (targetGenomes.length < 2) {
      throw new Error('系统发育分析至少需要2个基因组')
    }
    
    const results = {
      type: 'phylogeny',
      genomes: targetGenomes.length,
      snp_count: Math.floor(Math.random() * 5000) + 1000,
      tree_file: '',
      output_files: []
    }
    
    // 模拟系统发育分析过程
    await this.updateTaskStatus(task.id, 'running', 30)
    await this.sleep(3000)
    
    await this.updateTaskStatus(task.id, 'running', 60)
    await this.sleep(2000)
    
    await this.updateTaskStatus(task.id, 'running', 90)
    await this.sleep(1000)
    
    // 生成系统发育树文件
    const treeFile = path.join(outputDir, 'phylogenetic_tree.nwk')
    await this.generateMockTreeFile(treeFile, targetGenomes)
    results.tree_file = treeFile
    results.output_files.push(treeFile)
    
    return results
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId, status, progress, results = null, errorMessage = null) {
    try {
      await this.db.updateTaskStatus(taskId, status, progress, results, errorMessage)
      this.emit('taskProgress', taskId, { status, progress, results, errorMessage })
    } catch (error) {
      console.error('更新任务状态失败:', error)
    }
  }

  /**
   * 取消分析任务
   */
  async cancelTask(taskId) {
    try {
      if (this.runningTasks.has(taskId)) {
        const process = this.runningTasks.get(taskId)
        if (process && typeof process.kill === 'function') {
          process.kill('SIGTERM')
        }
        this.runningTasks.delete(taskId)
      }
      
      await this.updateTaskStatus(taskId, 'cancelled', 0)
      this.emit('taskCancelled', taskId)
      
      return true
    } catch (error) {
      console.error('取消任务失败:', error)
      throw error
    }
  }

  /**
   * 获取任务统计信息
   */
  async getTaskStats() {
    try {
      return this.db.getTaskStats()
    } catch (error) {
      console.error('获取任务统计失败:', error)
      throw new Error('获取任务统计失败')
    }
  }

  /**
   * 验证分析参数
   */
  validateAnalysisParams(analysisType, genomeIds, params) {
    const validTypes = ['annotation', 'mlst', 'resistance', 'virulence', 'phylogeny']
    if (!validTypes.includes(analysisType)) {
      throw new Error(`无效的分析类型: ${analysisType}`)
    }
    
    if (!Array.isArray(genomeIds) || genomeIds.length === 0) {
      throw new Error('必须选择至少一个基因组')
    }
    
    if (analysisType === 'phylogeny' && genomeIds.length < 2) {
      throw new Error('系统发育分析至少需要2个基因组')
    }
  }

  /**
   * 辅助方法：等待指定时间
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 生成模拟注释文件
   */
  async generateMockAnnotationFile(filePath, geneCount) {
    const content = `##gff-version 3
# Mock annotation file generated by PAMS
# Gene count: ${geneCount}
# Generated at: ${new Date().toISOString()}
`
    await fs.writeFile(filePath, content)
  }

  /**
   * 生成模拟MLST文件
   */
  async generateMockMLSTFile(filePath, sequenceType) {
    const content = `Sequence Type: ${sequenceType}
Generated at: ${new Date().toISOString()}
Alleles: ${this.generateMockAlleles().join(', ')}
`
    await fs.writeFile(filePath, content)
  }

  /**
   * 生成模拟耐药基因文件
   */
  async generateMockResistanceFile(filePath, genes) {
    const content = `Resistance Genes Found: ${genes.join(', ')}
Generated at: ${new Date().toISOString()}
Total genes: ${genes.length}
`
    await fs.writeFile(filePath, content)
  }

  /**
   * 生成模拟毒力基因文件
   */
  async generateMockVirulenceFile(filePath, genes) {
    const content = `Virulence Genes Found: ${genes.join(', ')}
Generated at: ${new Date().toISOString()}
Total genes: ${genes.length}
`
    await fs.writeFile(filePath, content)
  }

  /**
   * 生成模拟系统发育树文件
   */
  async generateMockTreeFile(filePath, genomes) {
    // 生成简单的Newick格式系统发育树
    const genomeNames = genomes.map(g => g.name)
    let tree = '('
    for (let i = 0; i < genomeNames.length; i++) {
      if (i > 0) tree += ','
      tree += `${genomeNames[i]}:0.${Math.floor(Math.random() * 100)}`
    }
    tree += ');'
    
    await fs.writeFile(filePath, tree)
  }

  /**
   * 生成模拟等位基因谱
   */
  generateMockAlleles() {
    const loci = ['adk', 'fumC', 'gyrB', 'icd', 'mdh', 'purA', 'recA']
    return loci.map(locus => `${locus}:${Math.floor(Math.random() * 20) + 1}`)
  }
}

module.exports = AnalysisService 