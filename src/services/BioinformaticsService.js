const fs = require('fs-extra')
const path = require('path')
const { spawn } = require('child_process')
const EventEmitter = require('events')

/**
 * 生物信息学分析服务
 * 实现MLST分析、分子血清学分析、毒力基因分析、耐药基因分析
 */
class BioinformaticsService extends EventEmitter {
  constructor(databaseService) {
    super()
    this.db = databaseService
    this.analysisTools = {
      mlst: {
        name: 'MLST Analysis',
        description: 'Multi-Locus Sequence Typing',
        databases: ['ecoli', 'salmonella', 'listeria', 'campylobacter']
      },
      serotyping: {
        name: 'Serotyping Analysis', 
        description: 'Molecular Serotyping',
        databases: ['ecoli_serotype', 'salmonella_serotype']
      },
      virulence: {
        name: 'Virulence Gene Analysis',
        description: 'Virulence Factor Detection',
        databases: ['vfdb', 'virulencefinder']
      },
      resistance: {
        name: 'Resistance Gene Analysis',
        description: 'Antimicrobial Resistance Gene Detection',
        databases: ['resfinder', 'card', 'argannot']
      }
    }
  }

  /**
   * MLST分析
   * @param {Array} genomeFiles - 基因组文件路径数组
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 分析结果
   */
  async performMLSTAnalysis(genomeFiles, options = {}) {
    try {
      const results = {
        analysisType: 'mlst',
        timestamp: new Date().toISOString(),
        genomes: [],
        summary: {
          totalGenomes: genomeFiles.length,
          typedGenomes: 0,
          novelAlleles: 0,
          novelSTs: 0
        }
      }

      for (const genomeFile of genomeFiles) {
        const genomeResult = await this.analyzeMLSTForGenome(genomeFile, options)
        results.genomes.push(genomeResult)
        
        if (genomeResult.sequenceType !== 'Unknown') {
          results.summary.typedGenomes++
        }
        if (genomeResult.novelAlleles > 0) {
          results.summary.novelAlleles += genomeResult.novelAlleles
        }
        if (genomeResult.isNovelST) {
          results.summary.novelSTs++
        }
      }

      return results
    } catch (error) {
      console.error('MLST分析失败:', error)
      throw new Error(`MLST分析失败: ${error.message}`)
    }
  }

  /**
   * 单个基因组的MLST分析
   * @param {string} genomeFile - 基因组文件路径
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 单个基因组的MLST结果
   */
  async analyzeMLSTForGenome(genomeFile, options) {
    const species = options.species || 'ecoli'
    const threshold = options.threshold || 95.0
    
    // 模拟MLST分析过程
    const mlstLoci = this.getMLSTLoci(species)
    const alleleResults = {}
    let novelAlleles = 0
    
    for (const locus of mlstLoci) {
      // 模拟等位基因检测
      const alleleResult = await this.detectAllele(genomeFile, locus, threshold)
      alleleResults[locus] = alleleResult
      
      if (alleleResult.isNovel) {
        novelAlleles++
      }
    }
    
    // 确定序列型
    const sequenceType = this.determineSequenceType(alleleResults, species)
    
    return {
      genomeFile: path.basename(genomeFile),
      species: species,
      sequenceType: sequenceType.st,
      isNovelST: sequenceType.isNovel,
      alleles: alleleResults,
      novelAlleles: novelAlleles,
      confidence: this.calculateConfidence(alleleResults)
    }
  }

  /**
   * 分子血清学分析
   * @param {Array} genomeFiles - 基因组文件路径数组
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 血清学分析结果
   */
  async performSerotypingAnalysis(genomeFiles, options = {}) {
    try {
      const results = {
        analysisType: 'serotyping',
        timestamp: new Date().toISOString(),
        genomes: [],
        summary: {
          totalGenomes: genomeFiles.length,
          typedGenomes: 0,
          serotypeDistribution: {}
        }
      }

      for (const genomeFile of genomeFiles) {
        const genomeResult = await this.analyzeSerotypingForGenome(genomeFile, options)
        results.genomes.push(genomeResult)
        
        if (genomeResult.serotype !== 'Unknown') {
          results.summary.typedGenomes++
          const serotype = genomeResult.serotype
          results.summary.serotypeDistribution[serotype] = 
            (results.summary.serotypeDistribution[serotype] || 0) + 1
        }
      }

      return results
    } catch (error) {
      console.error('血清学分析失败:', error)
      throw new Error(`血清学分析失败: ${error.message}`)
    }
  }

  /**
   * 单个基因组的血清学分析
   * @param {string} genomeFile - 基因组文件路径
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 单个基因组的血清学结果
   */
  async analyzeSerotypingForGenome(genomeFile, options) {
    const species = options.species || 'ecoli'
    const threshold = options.threshold || 90.0
    
    // 模拟血清学分析
    const serotypeGenes = this.getSerotypeGenes(species)
    const geneResults = {}
    
    for (const gene of serotypeGenes) {
      const geneResult = await this.detectSerotypeGene(genomeFile, gene, threshold)
      geneResults[gene.name] = geneResult
    }
    
    // 确定血清型
    const serotype = this.determineSerotype(geneResults, species)
    
    return {
      genomeFile: path.basename(genomeFile),
      species: species,
      serotype: serotype.type,
      confidence: serotype.confidence,
      genes: geneResults,
      antigenFormula: serotype.formula
    }
  }

  /**
   * 毒力基因分析
   * @param {Array} genomeFiles - 基因组文件路径数组
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 毒力基因分析结果
   */
  async performVirulenceAnalysis(genomeFiles, options = {}) {
    try {
      const results = {
        analysisType: 'virulence',
        timestamp: new Date().toISOString(),
        genomes: [],
        summary: {
          totalGenomes: genomeFiles.length,
          totalGenes: 0,
          geneDistribution: {}
        }
      }

      for (const genomeFile of genomeFiles) {
        const genomeResult = await this.analyzeVirulenceForGenome(genomeFile, options)
        results.genomes.push(genomeResult)
        
        results.summary.totalGenes += genomeResult.detectedGenes.length
        
        for (const gene of genomeResult.detectedGenes) {
          results.summary.geneDistribution[gene.name] = 
            (results.summary.geneDistribution[gene.name] || 0) + 1
        }
      }

      return results
    } catch (error) {
      console.error('毒力基因分析失败:', error)
      throw new Error(`毒力基因分析失败: ${error.message}`)
    }
  }

  /**
   * 单个基因组的毒力基因分析
   * @param {string} genomeFile - 基因组文件路径
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 单个基因组的毒力基因结果
   */
  async analyzeVirulenceForGenome(genomeFile, options) {
    const database = options.database || 'vfdb'
    const threshold = options.threshold || 90.0
    const minCoverage = options.minCoverage || 60.0
    
    // 模拟毒力基因检测
    const virulenceGenes = this.getVirulenceGenes(database)
    const detectedGenes = []
    
    for (const gene of virulenceGenes) {
      const detection = await this.detectVirulenceGene(genomeFile, gene, threshold, minCoverage)
      if (detection.detected) {
        detectedGenes.push({
          name: gene.name,
          function: gene.function,
          category: gene.category,
          identity: detection.identity,
          coverage: detection.coverage,
          evalue: detection.evalue
        })
      }
    }
    
    return {
      genomeFile: path.basename(genomeFile),
      database: database,
      detectedGenes: detectedGenes,
      virulenceProfile: this.categorizeVirulenceGenes(detectedGenes),
      pathogenicityScore: this.calculatePathogenicityScore(detectedGenes)
    }
  }

  /**
   * 耐药基因分析
   * @param {Array} genomeFiles - 基因组文件路径数组
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 耐药基因分析结果
   */
  async performResistanceAnalysis(genomeFiles, options = {}) {
    try {
      const results = {
        analysisType: 'resistance',
        timestamp: new Date().toISOString(),
        genomes: [],
        summary: {
          totalGenomes: genomeFiles.length,
          totalGenes: 0,
          resistanceClasses: {},
          antibioticResistance: {}
        }
      }

      for (const genomeFile of genomeFiles) {
        const genomeResult = await this.analyzeResistanceForGenome(genomeFile, options)
        results.genomes.push(genomeResult)
        
        results.summary.totalGenes += genomeResult.detectedGenes.length
        
        for (const gene of genomeResult.detectedGenes) {
          // 统计耐药基因类别
          results.summary.resistanceClasses[gene.class] = 
            (results.summary.resistanceClasses[gene.class] || 0) + 1
          
          // 统计抗生素耐药性
          for (const antibiotic of gene.antibiotics) {
            results.summary.antibioticResistance[antibiotic] = 
              (results.summary.antibioticResistance[antibiotic] || 0) + 1
          }
        }
      }

      return results
    } catch (error) {
      console.error('耐药基因分析失败:', error)
      throw new Error(`耐药基因分析失败: ${error.message}`)
    }
  }

  /**
   * 单个基因组的耐药基因分析
   * @param {string} genomeFile - 基因组文件路径
   * @param {Object} options - 分析选项
   * @returns {Promise<Object>} 单个基因组的耐药基因结果
   */
  async analyzeResistanceForGenome(genomeFile, options) {
    const database = options.database || 'resfinder'
    const threshold = options.threshold || 90.0
    const minCoverage = options.minCoverage || 60.0
    
    // 模拟耐药基因检测
    const resistanceGenes = this.getResistanceGenes(database)
    const detectedGenes = []
    
    for (const gene of resistanceGenes) {
      const detection = await this.detectResistanceGene(genomeFile, gene, threshold, minCoverage)
      if (detection.detected) {
        detectedGenes.push({
          name: gene.name,
          class: gene.class,
          mechanism: gene.mechanism,
          antibiotics: gene.antibiotics,
          identity: detection.identity,
          coverage: detection.coverage,
          evalue: detection.evalue
        })
      }
    }
    
    return {
      genomeFile: path.basename(genomeFile),
      database: database,
      detectedGenes: detectedGenes,
      resistanceProfile: this.categorizeResistanceGenes(detectedGenes),
      resistanceScore: this.calculateResistanceScore(detectedGenes)
    }
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取MLST基因座
   * @param {string} species - 菌种
   * @returns {Array} MLST基因座列表
   */
  getMLSTLoci(species) {
    const mlstSchemes = {
      ecoli: ['adk', 'fumC', 'gyrB', 'icd', 'mdh', 'purA', 'recA'],
      salmonella: ['aroC', 'dnaN', 'hemD', 'hisD', 'purE', 'sucA', 'thrA'],
      listeria: ['abcZ', 'bglA', 'cat', 'dapE', 'dat', 'ldh', 'lhkA'],
      campylobacter: ['aspA', 'glnA', 'gltA', 'glyA', 'pgm', 'tkt', 'uncA']
    }
    return mlstSchemes[species] || mlstSchemes.ecoli
  }

  /**
   * 检测等位基因
   * @param {string} genomeFile - 基因组文件
   * @param {string} locus - 基因座
   * @param {number} threshold - 相似度阈值
   * @returns {Promise<Object>} 等位基因检测结果
   */
  async detectAllele(genomeFile, locus, threshold) {
    // 模拟等位基因检测过程
    const identity = 95 + Math.random() * 5 // 95-100%
    const coverage = 90 + Math.random() * 10 // 90-100%
    const alleleNumber = Math.floor(Math.random() * 100) + 1

    return {
      locus: locus,
      allele: identity >= threshold ? alleleNumber : 'Unknown',
      identity: parseFloat(identity.toFixed(2)),
      coverage: parseFloat(coverage.toFixed(2)),
      isNovel: identity >= threshold && Math.random() < 0.1 // 10%概率为新等位基因
    }
  }

  /**
   * 确定序列型
   * @param {Object} alleleResults - 等位基因结果
   * @param {string} species - 菌种
   * @returns {Object} 序列型结果
   */
  determineSequenceType(alleleResults, species) {
    const alleles = Object.values(alleleResults)
    const unknownCount = alleles.filter(a => a.allele === 'Unknown').length

    if (unknownCount === 0) {
      const st = Math.floor(Math.random() * 1000) + 1
      return {
        st: st,
        isNovel: Math.random() < 0.05 // 5%概率为新ST
      }
    } else {
      return {
        st: 'Unknown',
        isNovel: false
      }
    }
  }

  /**
   * 计算置信度
   * @param {Object} alleleResults - 等位基因结果
   * @returns {number} 置信度
   */
  calculateConfidence(alleleResults) {
    const alleles = Object.values(alleleResults)
    const avgIdentity = alleles.reduce((sum, a) => sum + a.identity, 0) / alleles.length
    const avgCoverage = alleles.reduce((sum, a) => sum + a.coverage, 0) / alleles.length
    return parseFloat(((avgIdentity + avgCoverage) / 2).toFixed(2))
  }

  /**
   * 获取血清型基因
   * @param {string} species - 菌种
   * @returns {Array} 血清型基因列表
   */
  getSerotypeGenes(species) {
    const serotypeSchemes = {
      ecoli: [
        { name: 'wzx', type: 'O-antigen', description: 'O-antigen flippase' },
        { name: 'wzy', type: 'O-antigen', description: 'O-antigen polymerase' },
        { name: 'fliC', type: 'H-antigen', description: 'Flagellin' },
        { name: 'fljB', type: 'H-antigen', description: 'Flagellin phase 2' }
      ],
      salmonella: [
        { name: 'rfbS', type: 'O-antigen', description: 'O-antigen biosynthesis' },
        { name: 'fliC', type: 'H-antigen', description: 'Flagellin H1' },
        { name: 'fljB', type: 'H-antigen', description: 'Flagellin H2' }
      ]
    }
    return serotypeSchemes[species] || serotypeSchemes.ecoli
  }

  /**
   * 检测血清型基因
   * @param {string} genomeFile - 基因组文件
   * @param {Object} gene - 血清型基因
   * @param {number} threshold - 相似度阈值
   * @returns {Promise<Object>} 血清型基因检测结果
   */
  async detectSerotypeGene(genomeFile, gene, threshold) {
    const identity = 85 + Math.random() * 15 // 85-100%
    const coverage = 80 + Math.random() * 20 // 80-100%

    return {
      gene: gene.name,
      type: gene.type,
      detected: identity >= threshold,
      identity: parseFloat(identity.toFixed(2)),
      coverage: parseFloat(coverage.toFixed(2)),
      variant: identity >= threshold ? `${gene.name}_${Math.floor(Math.random() * 50) + 1}` : null
    }
  }

  /**
   * 确定血清型
   * @param {Object} geneResults - 血清型基因结果
   * @param {string} species - 菌种
   * @returns {Object} 血清型结果
   */
  determineSerotype(geneResults, species) {
    const detectedGenes = Object.values(geneResults).filter(g => g.detected)

    if (detectedGenes.length === 0) {
      return { type: 'Unknown', confidence: 0, formula: 'Unknown' }
    }

    // 模拟血清型确定
    const oAntigen = detectedGenes.find(g => g.type === 'O-antigen')
    const hAntigen = detectedGenes.find(g => g.type === 'H-antigen')

    const oType = oAntigen ? `O${Math.floor(Math.random() * 180) + 1}` : 'O?'
    const hType = hAntigen ? `H${Math.floor(Math.random() * 56) + 1}` : 'H?'

    const confidence = detectedGenes.reduce((sum, g) => sum + g.identity, 0) / detectedGenes.length

    return {
      type: `${oType}:${hType}`,
      confidence: parseFloat(confidence.toFixed(2)),
      formula: `${oType}:${hType}`
    }
  }

  /**
   * 获取毒力基因数据库
   * @param {string} database - 数据库名称
   * @returns {Array} 毒力基因列表
   */
  getVirulenceGenes(database) {
    const virulenceGenes = [
      { name: 'stx1', function: 'Shiga toxin 1', category: 'Toxin' },
      { name: 'stx2', function: 'Shiga toxin 2', category: 'Toxin' },
      { name: 'eae', function: 'Intimin', category: 'Adhesin' },
      { name: 'bfpA', function: 'Bundle-forming pilus', category: 'Adhesin' },
      { name: 'aggR', function: 'AggR regulator', category: 'Regulator' },
      { name: 'elt', function: 'Heat-labile enterotoxin', category: 'Toxin' },
      { name: 'est', function: 'Heat-stable enterotoxin', category: 'Toxin' },
      { name: 'invA', function: 'Invasion protein', category: 'Invasion' },
      { name: 'sipA', function: 'Secreted invasion protein', category: 'Invasion' },
      { name: 'hlyA', function: 'Hemolysin', category: 'Toxin' }
    ]
    return virulenceGenes
  }

  /**
   * 检测毒力基因
   * @param {string} genomeFile - 基因组文件
   * @param {Object} gene - 毒力基因
   * @param {number} threshold - 相似度阈值
   * @param {number} minCoverage - 最小覆盖度
   * @returns {Promise<Object>} 毒力基因检测结果
   */
  async detectVirulenceGene(genomeFile, gene, threshold, minCoverage) {
    const identity = 80 + Math.random() * 20 // 80-100%
    const coverage = 50 + Math.random() * 50 // 50-100%
    const evalue = Math.pow(10, -(Math.random() * 50 + 10)) // 1e-10 to 1e-60

    return {
      detected: identity >= threshold && coverage >= minCoverage,
      identity: parseFloat(identity.toFixed(2)),
      coverage: parseFloat(coverage.toFixed(2)),
      evalue: evalue.toExponential(2)
    }
  }

  /**
   * 分类毒力基因
   * @param {Array} detectedGenes - 检测到的毒力基因
   * @returns {Object} 毒力基因分类结果
   */
  categorizeVirulenceGenes(detectedGenes) {
    const categories = {}
    for (const gene of detectedGenes) {
      if (!categories[gene.category]) {
        categories[gene.category] = []
      }
      categories[gene.category].push(gene.name)
    }
    return categories
  }

  /**
   * 计算致病性评分
   * @param {Array} detectedGenes - 检测到的毒力基因
   * @returns {number} 致病性评分
   */
  calculatePathogenicityScore(detectedGenes) {
    const weights = {
      'Toxin': 3,
      'Adhesin': 2,
      'Invasion': 2,
      'Regulator': 1
    }

    let score = 0
    for (const gene of detectedGenes) {
      score += weights[gene.category] || 1
    }

    return Math.min(score, 10) // 最大评分10
  }

  /**
   * 获取耐药基因数据库
   * @param {string} database - 数据库名称
   * @returns {Array} 耐药基因列表
   */
  getResistanceGenes(database) {
    const resistanceGenes = [
      { name: 'blaTEM', class: 'Beta-lactam', mechanism: 'Beta-lactamase', antibiotics: ['Ampicillin', 'Penicillin'] },
      { name: 'blaCTX-M', class: 'Beta-lactam', mechanism: 'ESBL', antibiotics: ['Ceftriaxone', 'Cefotaxime'] },
      { name: 'aac(3)-IV', class: 'Aminoglycoside', mechanism: 'Acetyltransferase', antibiotics: ['Gentamicin', 'Tobramycin'] },
      { name: 'aph(3\')-Ia', class: 'Aminoglycoside', mechanism: 'Phosphotransferase', antibiotics: ['Kanamycin', 'Neomycin'] },
      { name: 'catA1', class: 'Chloramphenicol', mechanism: 'Acetyltransferase', antibiotics: ['Chloramphenicol'] },
      { name: 'sul1', class: 'Sulfonamide', mechanism: 'Target alteration', antibiotics: ['Sulfamethoxazole'] },
      { name: 'tetA', class: 'Tetracycline', mechanism: 'Efflux pump', antibiotics: ['Tetracycline', 'Doxycycline'] },
      { name: 'qnrS', class: 'Quinolone', mechanism: 'Target protection', antibiotics: ['Ciprofloxacin', 'Nalidixic acid'] },
      { name: 'ermB', class: 'Macrolide', mechanism: 'rRNA methylation', antibiotics: ['Erythromycin', 'Clarithromycin'] },
      { name: 'vanA', class: 'Glycopeptide', mechanism: 'Target alteration', antibiotics: ['Vancomycin', 'Teicoplanin'] }
    ]
    return resistanceGenes
  }

  /**
   * 检测耐药基因
   * @param {string} genomeFile - 基因组文件
   * @param {Object} gene - 耐药基因
   * @param {number} threshold - 相似度阈值
   * @param {number} minCoverage - 最小覆盖度
   * @returns {Promise<Object>} 耐药基因检测结果
   */
  async detectResistanceGene(genomeFile, gene, threshold, minCoverage) {
    const identity = 85 + Math.random() * 15 // 85-100%
    const coverage = 60 + Math.random() * 40 // 60-100%
    const evalue = Math.pow(10, -(Math.random() * 40 + 15)) // 1e-15 to 1e-55

    return {
      detected: identity >= threshold && coverage >= minCoverage,
      identity: parseFloat(identity.toFixed(2)),
      coverage: parseFloat(coverage.toFixed(2)),
      evalue: evalue.toExponential(2)
    }
  }

  /**
   * 分类耐药基因
   * @param {Array} detectedGenes - 检测到的耐药基因
   * @returns {Object} 耐药基因分类结果
   */
  categorizeResistanceGenes(detectedGenes) {
    const categories = {}
    for (const gene of detectedGenes) {
      if (!categories[gene.class]) {
        categories[gene.class] = []
      }
      categories[gene.class].push({
        name: gene.name,
        mechanism: gene.mechanism,
        antibiotics: gene.antibiotics
      })
    }
    return categories
  }

  /**
   * 计算耐药性评分
   * @param {Array} detectedGenes - 检测到的耐药基因
   * @returns {number} 耐药性评分
   */
  calculateResistanceScore(detectedGenes) {
    const weights = {
      'Beta-lactam': 3,
      'Aminoglycoside': 2,
      'Quinolone': 3,
      'Glycopeptide': 4,
      'Macrolide': 2,
      'Tetracycline': 1,
      'Chloramphenicol': 2,
      'Sulfonamide': 1
    }

    let score = 0
    const uniqueClasses = new Set()

    for (const gene of detectedGenes) {
      uniqueClasses.add(gene.class)
      score += weights[gene.class] || 1
    }

    // 多重耐药性加分
    if (uniqueClasses.size >= 3) {
      score += 2
    }

    return Math.min(score, 15) // 最大评分15
  }

  /**
   * 生成分析报告
   * @param {Object} results - 分析结果
   * @returns {Object} 格式化的分析报告
   */
  generateAnalysisReport(results) {
    const report = {
      analysisType: results.analysisType,
      timestamp: results.timestamp,
      summary: results.summary,
      recommendations: [],
      riskAssessment: 'Low'
    }

    switch (results.analysisType) {
      case 'mlst':
        report.recommendations = this.generateMLSTRecommendations(results)
        break
      case 'serotyping':
        report.recommendations = this.generateSerotypingRecommendations(results)
        break
      case 'virulence':
        report.recommendations = this.generateVirulenceRecommendations(results)
        report.riskAssessment = this.assessVirulenceRisk(results)
        break
      case 'resistance':
        report.recommendations = this.generateResistanceRecommendations(results)
        report.riskAssessment = this.assessResistanceRisk(results)
        break
    }

    return report
  }

  /**
   * 生成MLST分析建议
   * @param {Object} results - MLST分析结果
   * @returns {Array} 建议列表
   */
  generateMLSTRecommendations(results) {
    const recommendations = []

    if (results.summary.novelSTs > 0) {
      recommendations.push('发现新的序列型，建议提交到MLST数据库')
    }

    if (results.summary.novelAlleles > 0) {
      recommendations.push('发现新的等位基因，建议进行序列验证')
    }

    if (results.summary.typedGenomes / results.summary.totalGenomes < 0.8) {
      recommendations.push('部分基因组无法确定序列型，建议检查基因组质量')
    }

    return recommendations
  }

  /**
   * 生成血清学分析建议
   * @param {Object} results - 血清学分析结果
   * @returns {Array} 建议列表
   */
  generateSerotypingRecommendations(results) {
    const recommendations = []

    if (results.summary.typedGenomes / results.summary.totalGenomes < 0.7) {
      recommendations.push('部分基因组无法确定血清型，建议使用传统血清学方法验证')
    }

    const dominantSerotype = Object.keys(results.summary.serotypeDistribution)
      .reduce((a, b) => results.summary.serotypeDistribution[a] > results.summary.serotypeDistribution[b] ? a : b)

    if (dominantSerotype) {
      recommendations.push(`主要血清型为 ${dominantSerotype}，建议关注相关流行病学特征`)
    }

    return recommendations
  }

  /**
   * 生成毒力基因分析建议
   * @param {Object} results - 毒力基因分析结果
   * @returns {Array} 建议列表
   */
  generateVirulenceRecommendations(results) {
    const recommendations = []

    const totalGenes = results.summary.totalGenes
    if (totalGenes > 5) {
      recommendations.push('检测到多个毒力基因，建议加强生物安全防护')
    }

    if (results.summary.geneDistribution['stx1'] || results.summary.geneDistribution['stx2']) {
      recommendations.push('检测到志贺毒素基因，属于高致病性菌株')
    }

    return recommendations
  }

  /**
   * 生成耐药基因分析建议
   * @param {Object} results - 耐药基因分析结果
   * @returns {Array} 建议列表
   */
  generateResistanceRecommendations(results) {
    const recommendations = []

    const resistanceClasses = Object.keys(results.summary.resistanceClasses).length
    if (resistanceClasses >= 3) {
      recommendations.push('检测到多重耐药性，建议进行药敏试验验证')
    }

    if (results.summary.antibioticResistance['Vancomycin']) {
      recommendations.push('检测到万古霉素耐药基因，需要特别关注')
    }

    if (results.summary.antibioticResistance['Ciprofloxacin']) {
      recommendations.push('检测到喹诺酮类耐药基因，建议避免使用相关抗生素')
    }

    return recommendations
  }

  /**
   * 评估毒力风险
   * @param {Object} results - 毒力基因分析结果
   * @returns {string} 风险等级
   */
  assessVirulenceRisk(results) {
    const totalGenes = results.summary.totalGenes
    const avgScore = results.genomes.reduce((sum, g) => sum + g.pathogenicityScore, 0) / results.genomes.length

    if (avgScore >= 7 || totalGenes >= 10) {
      return 'High'
    } else if (avgScore >= 4 || totalGenes >= 5) {
      return 'Medium'
    } else {
      return 'Low'
    }
  }

  /**
   * 评估耐药风险
   * @param {Object} results - 耐药基因分析结果
   * @returns {string} 风险等级
   */
  assessResistanceRisk(results) {
    const resistanceClasses = Object.keys(results.summary.resistanceClasses).length
    const avgScore = results.genomes.reduce((sum, g) => sum + g.resistanceScore, 0) / results.genomes.length

    if (avgScore >= 10 || resistanceClasses >= 5) {
      return 'High'
    } else if (avgScore >= 6 || resistanceClasses >= 3) {
      return 'Medium'
    } else {
      return 'Low'
    }
  }
}

module.exports = BioinformaticsService
