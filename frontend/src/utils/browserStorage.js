/**
 * 浏览器端存储工具类
 * 使用IndexedDB替代localStorage来存储大文件
 */

class BrowserStorage {
  constructor () {
    this.dbName = 'PAMS_DB'
    this.version = 1
    this.db = null
  }

  /**
   * 初始化数据库
   */
  async init () {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        reject(new Error('无法打开IndexedDB数据库'))
      }

      request.onsuccess = (event) => {
        this.db = event.target.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // 创建基因组存储
        if (!db.objectStoreNames.contains('genomes')) {
          const genomeStore = db.createObjectStore('genomes', { keyPath: 'id' })
          genomeStore.createIndex('name', 'name', { unique: false })
          genomeStore.createIndex('strainId', 'strainId', { unique: false })
          genomeStore.createIndex('uploadDate', 'uploadDate', { unique: false })
        }

        // 创建菌株存储
        if (!db.objectStoreNames.contains('strains')) {
          const strainStore = db.createObjectStore('strains', { keyPath: 'id' })
          strainStore.createIndex('strainNumber', 'strainNumber', { unique: true })
          strainStore.createIndex('species', 'species', { unique: false })
        }

        // 创建分析结果存储
        if (!db.objectStoreNames.contains('analysisResults')) {
          const analysisStore = db.createObjectStore('analysisResults', { keyPath: 'id' })
          analysisStore.createIndex('genomeId', 'genomeId', { unique: false })
          analysisStore.createIndex('analysisType', 'analysisType', { unique: false })
        }

        // 创建系统配置存储
        if (!db.objectStoreNames.contains('systemConfig')) {
          db.createObjectStore('systemConfig', { keyPath: 'key' })
        }
      }
    })
  }

  /**
   * 确保数据库已初始化
   */
  async ensureDB () {
    if (!this.db) {
      await this.init()
    }
  }

  /**
   * 保存基因组数据
   */
  async saveGenome (genomeData) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['genomes'], 'readwrite')
      const store = transaction.objectStore('genomes')

      // 压缩基因组内容以节省空间
      const compressedData = {
        ...genomeData,
        content: this.compressString(genomeData.content)
      }

      const request = store.add(compressedData)

      request.onsuccess = () => {
        resolve(genomeData)
      }

      request.onerror = () => {
        reject(new Error('保存基因组数据失败'))
      }
    })
  }

  /**
   * 获取所有基因组
   */
  async getAllGenomes () {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['genomes'], 'readonly')
      const store = transaction.objectStore('genomes')
      const request = store.getAll()

      request.onsuccess = () => {
        try {
          const genomes = request.result.map(genome => {
            try {
              return {
                ...genome,
                content: this.decompressString(genome.content)
              }
            } catch (error) {
              console.error('Error decompressing genome:', genome.id, error)
              // 如果解压缩失败，返回基本信息但不包含内容
              return {
                ...genome,
                content: '',
                error: 'Decompression failed'
              }
            }
          })
          resolve(genomes)
        } catch (error) {
          console.error('Error processing genomes:', error)
          reject(error)
        }
      }

      request.onerror = () => {
        reject(new Error('获取基因组数据失败'))
      }
    })
  }

  /**
   * 根据ID获取基因组
   */
  async getGenomeById (id) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['genomes'], 'readonly')
      const store = transaction.objectStore('genomes')
      const request = store.get(id)

      request.onsuccess = () => {
        if (request.result) {
          const genome = {
            ...request.result,
            content: this.decompressString(request.result.content)
          }
          resolve(genome)
        } else {
          resolve(null)
        }
      }

      request.onerror = () => {
        reject(new Error('获取基因组数据失败'))
      }
    })
  }

  /**
   * 删除基因组
   */
  async deleteGenome (id) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['genomes'], 'readwrite')
      const store = transaction.objectStore('genomes')
      const request = store.delete(id)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error('删除基因组数据失败'))
      }
    })
  }

  /**
   * 保存菌株数据
   */
  async saveStrains (strains) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['strains'], 'readwrite')
      const store = transaction.objectStore('strains')

      // 清空现有数据
      store.clear()

      // 添加新数据
      strains.forEach(strain => {
        store.add(strain)
      })

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(new Error('保存菌株数据失败'))
      }
    })
  }

  /**
   * 获取所有菌株
   */
  async getAllStrains () {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['strains'], 'readonly')
      const store = transaction.objectStore('strains')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('获取菌株数据失败'))
      }
    })
  }

  /**
   * 保存分析结果
   */
  async saveAnalysisResult (analysisData) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['analysisResults'], 'readwrite')
      const store = transaction.objectStore('analysisResults')
      const request = store.add(analysisData)

      request.onsuccess = () => {
        resolve(analysisData)
      }

      request.onerror = () => {
        reject(new Error('保存分析结果失败'))
      }
    })
  }

  /**
   * 获取分析结果
   */
  async getAnalysisResults (genomeId) {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['analysisResults'], 'readonly')
      const store = transaction.objectStore('analysisResults')
      const index = store.index('genomeId')
      const request = index.getAll(genomeId)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error('获取分析结果失败'))
      }
    })
  }

  /**
   * 简单的字符串压缩（使用LZ-string算法的简化版本）
   */
  compressString (str) {
    // 简单的RLE压缩
    let compressed = ''
    let count = 1
    let current = str[0]

    for (let i = 1; i < str.length; i++) {
      if (str[i] === current && count < 255) {
        count++
      } else {
        if (count > 3) {
          compressed += `${current}${count}`
        } else {
          compressed += current.repeat(count)
        }
        current = str[i]
        count = 1
      }
    }

    // 处理最后一组
    if (count > 3) {
      compressed += `${current}${count}`
    } else {
      compressed += current.repeat(count)
    }

    return compressed
  }

  /**
   * 解压缩字符串
   */
  decompressString (compressed) {
    // 检查输入是否有效
    if (!compressed || typeof compressed !== 'string') {
      console.warn('Invalid compressed data:', compressed)
      return ''
    }

    try {
      // 简单的RLE解压缩
      let decompressed = ''
      let i = 0
      const MAX_REPEAT_COUNT = 1000000 // 最大重复次数限制，防止内存溢出

      while (i < compressed.length) {
        const char = compressed[i]

        // 检查是否是压缩格式
        if (i + 1 < compressed.length && /\d/.test(compressed[i + 1])) {
          let numStr = ''
          let j = i + 1

          while (j < compressed.length && /\d/.test(compressed[j])) {
            numStr += compressed[j]
            j++
          }

          const count = parseInt(numStr)

          // 安全检查：防止count过大导致内存溢出
          if (isNaN(count) || count < 0) {
            console.warn('Invalid repeat count:', numStr)
            decompressed += char
            i++
            continue
          }

          if (count > MAX_REPEAT_COUNT) {
            console.warn('Repeat count too large:', count, 'limiting to', MAX_REPEAT_COUNT)
            decompressed += char.repeat(MAX_REPEAT_COUNT)
          } else {
            decompressed += char.repeat(count)
          }

          i = j
        } else {
          decompressed += char
          i++
        }
      }

      return decompressed
    } catch (error) {
      console.error('Error decompressing string:', error)
      // 如果解压缩失败，返回原始数据
      return compressed
    }
  }

  /**
   * 获取存储使用情况
   */
  async getStorageUsage () {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        used: estimate.usage,
        available: estimate.quota,
        percentage: (estimate.usage / estimate.quota * 100).toFixed(2)
      }
    }
    return null
  }

  /**
   * 清理存储
   */
  async clearStorage () {
    await this.ensureDB()

    const storeNames = ['genomes', 'strains', 'analysisResults', 'systemConfig']

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeNames, 'readwrite')

      storeNames.forEach(storeName => {
        const store = transaction.objectStore(storeName)
        store.clear()
      })

      transaction.oncomplete = () => {
        resolve()
      }

      transaction.onerror = () => {
        reject(new Error('清理存储失败'))
      }
    })
  }

  /**
   * 清理损坏的基因组数据
   */
  async cleanupCorruptedGenomes () {
    await this.ensureDB()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['genomes'], 'readwrite')
      const store = transaction.objectStore('genomes')
      const request = store.getAll()

      request.onsuccess = () => {
        const genomes = request.result
        let cleanedCount = 0

        genomes.forEach(genome => {
          try {
            // 尝试解压缩内容
            this.decompressString(genome.content)
          } catch (error) {
            console.log('Removing corrupted genome:', genome.id, error.message)
            store.delete(genome.id)
            cleanedCount++
          }
        })

        transaction.oncomplete = () => {
          console.log(`Cleaned up ${cleanedCount} corrupted genomes`)
          resolve(cleanedCount)
        }

        transaction.onerror = () => {
          reject(new Error('清理损坏数据失败'))
        }
      }

      request.onerror = () => {
        reject(new Error('获取基因组数据失败'))
      }
    })
  }
}

// 创建单例实例
const browserStorage = new BrowserStorage()

export default browserStorage
