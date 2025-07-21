const https = require('https')
const { URL } = require('url')

class NCBIService {
  constructor() {
    this.baseURL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils'
    this.apiKey = null // 可以设置NCBI API密钥以提高请求限制
  }

  /**
   * 设置NCBI API密钥
   * @param {string} apiKey 
   */
  setApiKey(apiKey) {
    this.apiKey = apiKey
  }

  /**
   * 发送HTTP GET请求
   * @param {string} url 
   * @returns {Promise<string>}
   */
  async httpGet(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = ''
        
        response.on('data', (chunk) => {
          data += chunk
        })
        
        response.on('end', () => {
          if (response.statusCode === 200) {
            resolve(data)
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`))
          }
        })
      })
      
      request.on('error', (error) => {
        reject(error)
      })
      
      request.setTimeout(10000, () => {
        request.destroy()
        reject(new Error('请求超时'))
      })
    })
  }

  /**
   * 搜索菌种的NCBI Taxonomy ID
   * @param {string} scientificName 学名
   * @returns {Promise<Object>} 包含txid和相关信息的对象
   */
  async searchTaxonomyId(scientificName) {
    try {
      // 构建搜索URL
      const searchParams = new URLSearchParams({
        db: 'taxonomy',
        term: `"${scientificName}"[Scientific Name]`,
        retmode: 'json',
        retmax: 5
      })
      
      if (this.apiKey) {
        searchParams.append('api_key', this.apiKey)
      }
      
      const searchUrl = `${this.baseURL}/esearch.fcgi?${searchParams.toString()}`
      
      // 执行搜索
      const searchResponse = await this.httpGet(searchUrl)
      const searchData = JSON.parse(searchResponse)
      
      if (!searchData.esearchresult || !searchData.esearchresult.idlist || searchData.esearchresult.idlist.length === 0) {
        throw new Error('未找到匹配的分类信息')
      }
      
      // 获取第一个匹配的ID
      const txid = searchData.esearchresult.idlist[0]
      
      // 获取详细信息
      const detailParams = new URLSearchParams({
        db: 'taxonomy',
        id: txid,
        retmode: 'xml'
      })
      
      if (this.apiKey) {
        detailParams.append('api_key', this.apiKey)
      }
      
      const detailUrl = `${this.baseURL}/efetch.fcgi?${detailParams.toString()}`
      const detailResponse = await this.httpGet(detailUrl)
      
      // 解析XML响应获取详细信息
      const taxonomyInfo = this.parseTaxonomyXML(detailResponse)
      
      return {
        txid: txid,
        scientificName: taxonomyInfo.scientificName,
        commonName: taxonomyInfo.commonName,
        rank: taxonomyInfo.rank,
        lineage: taxonomyInfo.lineage,
        success: true
      }
      
    } catch (error) {
      console.error('NCBI搜索失败:', error)
      return {
        txid: null,
        error: error.message,
        success: false
      }
    }
  }

  /**
   * 解析NCBI Taxonomy XML响应
   * @param {string} xmlData 
   * @returns {Object}
   */
  parseTaxonomyXML(xmlData) {
    try {
      // 简单的XML解析，提取关键信息
      const scientificNameMatch = xmlData.match(/<ScientificName>([^<]+)<\/ScientificName>/)
      const commonNameMatch = xmlData.match(/<CommonName>([^<]+)<\/CommonName>/)
      const rankMatch = xmlData.match(/<Rank>([^<]+)<\/Rank>/)
      
      // 提取分类层级信息
      const lineageMatches = xmlData.match(/<Lineage>([^<]+)<\/Lineage>/)
      const lineage = lineageMatches ? lineageMatches[1] : ''
      
      return {
        scientificName: scientificNameMatch ? scientificNameMatch[1] : '',
        commonName: commonNameMatch ? commonNameMatch[1] : '',
        rank: rankMatch ? rankMatch[1] : '',
        lineage: lineage
      }
    } catch (error) {
      console.error('解析XML失败:', error)
      return {
        scientificName: '',
        commonName: '',
        rank: '',
        lineage: ''
      }
    }
  }

  /**
   * 批量搜索多个菌种的分类信息
   * @param {Array<string>} scientificNames 学名数组
   * @returns {Promise<Array<Object>>}
   */
  async batchSearchTaxonomyIds(scientificNames) {
    const results = []
    
    for (const name of scientificNames) {
      try {
        const result = await this.searchTaxonomyId(name)
        results.push({
          inputName: name,
          ...result
        })
        
        // 添加延迟以避免超过NCBI API限制（每秒3个请求）
        await new Promise(resolve => setTimeout(resolve, 350))
        
      } catch (error) {
        results.push({
          inputName: name,
          txid: null,
          error: error.message,
          success: false
        })
      }
    }
    
    return results
  }

  /**
   * 根据TXID获取菌种详细信息
   * @param {string} txid 
   * @returns {Promise<Object>}
   */
  async getTaxonomyDetails(txid) {
    try {
      const detailParams = new URLSearchParams({
        db: 'taxonomy',
        id: txid,
        retmode: 'xml'
      })
      
      if (this.apiKey) {
        detailParams.append('api_key', this.apiKey)
      }
      
      const detailUrl = `${this.baseURL}/efetch.fcgi?${detailParams.toString()}`
      const detailResponse = await this.httpGet(detailUrl)
      
      const taxonomyInfo = this.parseTaxonomyXML(detailResponse)
      
      return {
        txid: txid,
        ...taxonomyInfo,
        success: true
      }
      
    } catch (error) {
      console.error('获取NCBI详细信息失败:', error)
      return {
        txid: txid,
        error: error.message,
        success: false
      }
    }
  }

  /**
   * 验证TXID是否有效
   * @param {string} txid 
   * @returns {Promise<boolean>}
   */
  async validateTaxonomyId(txid) {
    try {
      const result = await this.getTaxonomyDetails(txid)
      return result.success && result.scientificName
    } catch (error) {
      return false
    }
  }

  /**
   * 搜索菌种的常用缩写
   * @param {string} scientificName 
   * @returns {string} 生成的缩写
   */
  generateAbbreviation(scientificName) {
    try {
      if (!scientificName || typeof scientificName !== 'string') {
        return ''
      }
      
      const parts = scientificName.trim().split(/\s+/)
      if (parts.length < 2) {
        return scientificName.substring(0, 3).toUpperCase()
      }
      
      // 取属名首字母和种名前3个字母
      const genus = parts[0].charAt(0).toUpperCase()
      const species = parts[1].substring(0, 3).toLowerCase()
      
      return genus + species
      
    } catch (error) {
      console.error('生成缩写失败:', error)
      return ''
    }
  }
}

module.exports = NCBIService
