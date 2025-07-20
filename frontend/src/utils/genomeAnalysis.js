/**
 * 基因组序列分析工具类
 * 用于分析FASTA格式的基因组序列，获取序列统计信息
 */

import { parse } from 'biojs-io-fasta'

/**
 * 分析FASTA序列内容
 * @param {string} fastaContent - FASTA格式的序列内容
 * @returns {Object} 分析结果
 */
export function analyzeFastaSequence (fastaContent) {
  try {
    // 解析FASTA文件
    const sequences = parse(fastaContent)

    if (!sequences || sequences.length === 0) {
      throw new Error('未找到有效的序列数据')
    }

    const results = {
      totalSequences: sequences.length,
      sequences: [],
      summary: {
        totalLength: 0,
        totalGC: 0,
        totalN: 0,
        contigs: 0,
        n50: 0,
        averageLength: 0,
        maxLength: 0,
        minLength: Infinity
      }
    }

    // 分析每个序列
    sequences.forEach((seq, index) => {
      const analysis = analyzeSequence(seq.seq, seq.name || `Sequence_${index + 1}`)
      results.sequences.push(analysis)

      // 更新总体统计
      results.summary.totalLength += analysis.length
      results.summary.totalGC += analysis.gcCount
      results.summary.totalN += analysis.nCount
      results.summary.contigs += 1
      results.summary.maxLength = Math.max(results.summary.maxLength, analysis.length)
      results.summary.minLength = Math.min(results.summary.minLength, analysis.length)
    })

    // 计算平均值和百分比
    results.summary.averageLength = Math.round(results.summary.totalLength / results.summary.contigs)
    results.summary.gcPercentage = ((results.summary.totalGC / results.summary.totalLength) * 100).toFixed(2)
    results.summary.nPercentage = ((results.summary.totalN / results.summary.totalLength) * 100).toFixed(2)

    // 计算N50
    results.summary.n50 = calculateN50(results.sequences.map(s => s.length))

    return results
  } catch (error) {
    console.error('FASTA序列分析失败:', error)
    throw new Error(`序列分析失败: ${error.message}`)
  }
}

/**
 * 分析单个序列
 * @param {string} sequence - 序列字符串
 * @param {string} id - 序列ID
 * @returns {Object} 序列分析结果
 */
function analyzeSequence (sequence, id) {
  const cleanSeq = sequence.toUpperCase().replace(/\s/g, '')

  const analysis = {
    id,
    length: cleanSeq.length,
    gcCount: 0,
    atCount: 0,
    nCount: 0,
    otherCount: 0,
    gcPercentage: 0,
    atPercentage: 0,
    nPercentage: 0
  }

  // 统计各种碱基
  for (let i = 0; i < cleanSeq.length; i++) {
    const base = cleanSeq[i]
    switch (base) {
    case 'G':
    case 'C':
      analysis.gcCount++
      break
    case 'A':
    case 'T':
      analysis.atCount++
      break
    case 'N':
      analysis.nCount++
      break
    default:
      analysis.otherCount++
      break
    }
  }

  // 计算百分比
  if (analysis.length > 0) {
    analysis.gcPercentage = ((analysis.gcCount / analysis.length) * 100).toFixed(2)
    analysis.atPercentage = ((analysis.atCount / analysis.length) * 100).toFixed(2)
    analysis.nPercentage = ((analysis.nCount / analysis.length) * 100).toFixed(2)
  }

  return analysis
}

/**
 * 计算N50值
 * @param {Array} lengths - 序列长度数组
 * @returns {number} N50值
 */
function calculateN50 (lengths) {
  if (!lengths || lengths.length === 0) return 0

  // 按长度降序排列
  const sortedLengths = lengths.slice().sort((a, b) => b - a)
  const totalLength = sortedLengths.reduce((sum, len) => sum + len, 0)
  const halfLength = totalLength / 2

  let cumulativeLength = 0
  for (const length of sortedLengths) {
    cumulativeLength += length
    if (cumulativeLength >= halfLength) {
      return length
    }
  }

  return 0
}

/**
 * 验证FASTA格式
 * @param {string} content - 文件内容
 * @returns {boolean} 是否为有效的FASTA格式
 */
export function validateFastaFormat (content) {
  if (!content || typeof content !== 'string') {
    return false
  }

  // 检查是否包含FASTA标识符
  const lines = content.split('\n')
  let hasHeader = false

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith('>')) {
      hasHeader = true
      break
    }
  }

  return hasHeader
}

/**
 * 格式化序列分析结果为可读格式
 * @param {Object} analysis - 分析结果
 * @returns {Object} 格式化后的结果
 */
export function formatAnalysisResults (analysis) {
  return {
    基本信息: {
      序列总数: analysis.totalSequences,
      总长度: formatNumber(analysis.summary.totalLength),
      平均长度: formatNumber(analysis.summary.averageLength),
      最大长度: formatNumber(analysis.summary.maxLength),
      最小长度: formatNumber(analysis.summary.minLength)
    },
    碱基组成: {
      GC含量: `${analysis.summary.gcPercentage}%`,
      N碱基含量: `${analysis.summary.nPercentage}%`,
      GC碱基数: formatNumber(analysis.summary.totalGC),
      N碱基数: formatNumber(analysis.summary.totalN)
    },
    质量指标: {
      Contigs数量: analysis.summary.contigs,
      N50值: formatNumber(analysis.summary.n50)
    },
    详细序列: analysis.sequences.map(seq => ({
      序列ID: seq.id,
      长度: formatNumber(seq.length),
      GC含量: `${seq.gcPercentage}%`,
      AT含量: `${seq.atPercentage}%`,
      N含量: `${seq.nPercentage}%`
    }))
  }
}

/**
 * 格式化数字显示
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
function formatNumber (num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * 生成序列质量报告
 * @param {Object} analysis - 分析结果
 * @returns {Object} 质量报告
 */
export function generateQualityReport (analysis) {
  const report = {
    overall: 'good',
    issues: [],
    recommendations: []
  }

  // 检查GC含量
  const gcPercentage = parseFloat(analysis.summary.gcPercentage)
  if (gcPercentage < 30 || gcPercentage > 70) {
    report.issues.push(`GC含量异常: ${gcPercentage}% (正常范围: 30-70%)`)
    report.overall = 'warning'
  }

  // 检查N含量
  const nPercentage = parseFloat(analysis.summary.nPercentage)
  if (nPercentage > 5) {
    report.issues.push(`N碱基含量过高: ${nPercentage}% (建议 < 5%)`)
    report.overall = 'warning'
  }

  // 检查序列数量
  if (analysis.summary.contigs > 1000) {
    report.issues.push(`Contigs数量过多: ${analysis.summary.contigs} (可能需要进一步组装)`)
    report.recommendations.push('考虑使用更高质量的组装算法')
  }

  // 检查N50
  if (analysis.summary.n50 < 10000) {
    report.issues.push(`N50值较低: ${analysis.summary.n50} bp (建议 > 10kb)`)
    report.recommendations.push('提高测序深度或使用长读长技术')
  }

  if (report.issues.length === 0) {
    report.overall = 'excellent'
  } else if (report.issues.length > 2) {
    report.overall = 'poor'
  }

  return report
}
