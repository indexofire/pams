#!/usr/bin/env node

/**
 * 生成大量测试数据的脚本
 * 用于测试CLI导入工具的性能
 */

const fs = require('fs-extra')
const path = require('path')

// 配置
const OUTPUT_FILE = 'examples/large-test-strains.csv'
const RECORD_COUNT = 5000 // 生成5000条记录

// 数据模板
const species = [
  'Salmonella enterica',
  'Escherichia coli',
  'Listeria monocytogenes',
  'Campylobacter jejuni',
  'Vibrio parahaemolyticus',
  'Shigella flexneri',
  'Staphylococcus aureus',
  'Enterococcus faecium',
  'Klebsiella pneumoniae',
  'Acinetobacter baumannii'
]

const regions = [
  '北京', '上海', '广州', '深圳', '杭州', '南京', '武汉', '成都', '西安', '青岛',
  '大连', '厦门', '苏州', '无锡', '宁波', '重庆', '天津', '长沙', '郑州', '济南'
]

const sources = ['临床', '食品', '环境', '动物', '水源']

const stTypes = [
  'ST1', 'ST11', 'ST17', 'ST19', 'ST21', 'ST131', 'ST239', 'ST245', 'ST3', 'ST195'
]

const serotypes = [
  'Typhimurium', 'O157:H7', '1/2a', 'HS:19', 'O3:K6', '2a', 'CC8', 'vanA', 'K47', 'GC1'
]

const virulenceGenes = [
  'invA;hilA', 'stx1;stx2', 'hlyA;prfA', 'cdtA;cdtB', 'tdh;trh',
  'ipaH;virF', 'mecA;pvl', 'esp;hyl', 'blaKPC;blaCTX-M', 'blaOXA-23;blaOXA-51'
]

const resistanceProfiles = [
  'AMP;TET', 'AMP;CHL;TET', 'PEN;ERY', 'CIP;ERY;TET', 'AMP;STR',
  'AMP;CHL;SXT;TET', 'OXA;VAN;LIN', 'VAN;AMP;HLG', 'CTX;CAZ;FEP', 'IMP;MEM;COL'
]

/**
 * 生成随机数据
 */
function generateRecord(index) {
  const strainId = `LARGE${String(index + 1).padStart(6, '0')}`
  const randomSpecies = species[Math.floor(Math.random() * species.length)]
  const randomRegion = regions[Math.floor(Math.random() * regions.length)]
  const randomSource = sources[Math.floor(Math.random() * sources.length)]
  const randomST = stTypes[Math.floor(Math.random() * stTypes.length)]
  const randomSerotype = serotypes[Math.floor(Math.random() * serotypes.length)]
  const randomVF = virulenceGenes[Math.floor(Math.random() * virulenceGenes.length)]
  const randomAMR = resistanceProfiles[Math.floor(Math.random() * resistanceProfiles.length)]

  return {
    菌株编号: strainId,
    菌种: randomSpecies,
    地区: randomRegion,
    样本来源: randomSource,
    ST型: randomST,
    血清型: randomSerotype,
    毒力基因: randomVF,
    耐药谱: randomAMR
  }
}

/**
 * 生成CSV内容
 */
function generateCSV() {
  console.log(`🧬 开始生成 ${RECORD_COUNT} 条测试数据...`)
  
  // CSV头部
  const headers = ['菌株编号', '菌种', '地区', '样本来源', 'ST型', '血清型', '毒力基因', '耐药谱']
  let csvContent = headers.join(',') + '\n'
  
  // 生成数据行
  for (let i = 0; i < RECORD_COUNT; i++) {
    const record = generateRecord(i)
    const row = headers.map(header => record[header]).join(',')
    csvContent += row + '\n'
    
    // 显示进度
    if ((i + 1) % 1000 === 0) {
      console.log(`📊 已生成 ${i + 1} / ${RECORD_COUNT} 条记录`)
    }
  }
  
  return csvContent
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 PAMS 测试数据生成器')
    console.log(`📁 输出文件: ${OUTPUT_FILE}`)
    console.log(`📊 记录数量: ${RECORD_COUNT}`)
    console.log('')
    
    // 确保输出目录存在
    await fs.ensureDir(path.dirname(OUTPUT_FILE))
    
    // 生成CSV内容
    const csvContent = generateCSV()
    
    // 写入文件
    console.log('💾 写入文件...')
    await fs.writeFile(OUTPUT_FILE, csvContent, 'utf8')
    
    // 获取文件大小
    const stats = await fs.stat(OUTPUT_FILE)
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2)
    
    console.log('')
    console.log('✅ 测试数据生成完成!')
    console.log(`📁 文件路径: ${OUTPUT_FILE}`)
    console.log(`📊 记录数量: ${RECORD_COUNT}`)
    console.log(`💾 文件大小: ${fileSizeMB} MB`)
    console.log('')
    console.log('🔧 使用方法:')
    console.log(`   node cli/import-strains.js ${OUTPUT_FILE} --dry-run`)
    console.log(`   node cli/import-strains.js ${OUTPUT_FILE} --batch-size 2000`)
    
  } catch (error) {
    console.error('❌ 生成测试数据失败:', error.message)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}

module.exports = { generateRecord, generateCSV }
