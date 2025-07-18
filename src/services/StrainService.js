const path = require('path')
const fs = require('fs-extra')

class StrainService {
  constructor(databaseService) {
    this.db = databaseService
  }

  /**
   * 获取所有菌株
   */
  async getAllStrains() {
    try {
      return this.db.getAllStrains()
    } catch (error) {
      console.error('获取菌株列表失败:', error)
      throw new Error('获取菌株列表失败')
    }
  }

  /**
   * 根据ID获取菌株
   */
  async getStrainById(id) {
    try {
      return this.db.getStrainById(id)
    } catch (error) {
      console.error('获取菌株详情失败:', error)
      throw new Error('获取菌株详情失败')
    }
  }

  /**
   * 创建新菌株
   */
  async createStrain(strainData) {
    try {
      // 验证必要字段
      this.validateStrainData(strainData)
      
      // 检查菌株编号是否重复
      const existingStrains = this.db.getAllStrains()
      const strainIdExists = existingStrains.some(strain => 
        strain.strain_id === strainData.strain_id
      )
      
      if (strainIdExists) {
        throw new Error('菌株编号已存在')
      }

      // 处理日期字段，确保所有日期都是字符串格式
      const processedData = { ...strainData }
      
      // 转换日期对象为字符串格式
      if (processedData.onset_date instanceof Date) {
        processedData.onset_date = processedData.onset_date.toISOString().split('T')[0]
      }
      if (processedData.sampling_date instanceof Date) {
        processedData.sampling_date = processedData.sampling_date.toISOString().split('T')[0]
      }
      if (processedData.isolation_date instanceof Date) {
        processedData.isolation_date = processedData.isolation_date.toISOString().split('T')[0]
      }

      // 添加创建时间
      const strainWithTimestamp = {
        ...processedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      return await this.db.createStrain(strainWithTimestamp)
    } catch (error) {
      console.error('创建菌株失败:', error)
      throw error
    }
  }

  /**
   * 更新菌株信息
   */
  async updateStrain(id, strainData) {
    try {
      // 验证必要字段
      this.validateStrainData(strainData, false)
      
      // 检查菌株是否存在
      const existingStrain = this.db.getStrainById(id)
      if (!existingStrain) {
        throw new Error('菌株不存在')
      }

      // 检查名称是否与其他菌株重复
      if (strainData.name) {
        const allStrains = this.db.getAllStrains()
        const nameExists = allStrains.some(strain => 
          strain.id !== parseInt(id) && 
          strain.name.toLowerCase() === strainData.name.toLowerCase()
        )
        
        if (nameExists) {
          throw new Error('菌株名称已存在')
        }
      }

      // 处理日期字段，确保所有日期都是字符串格式
      const processedData = { ...strainData }
      
      // 转换日期对象为字符串格式
      if (processedData.onset_date instanceof Date) {
        processedData.onset_date = processedData.onset_date.toISOString().split('T')[0]
      }
      if (processedData.sampling_date instanceof Date) {
        processedData.sampling_date = processedData.sampling_date.toISOString().split('T')[0]
      }
      if (processedData.isolation_date instanceof Date) {
        processedData.isolation_date = processedData.isolation_date.toISOString().split('T')[0]
      }

      // 添加更新时间
      const strainWithTimestamp = {
        ...processedData,
        updated_at: new Date().toISOString()
      }

      return await this.db.updateStrain(id, strainWithTimestamp)
    } catch (error) {
      console.error('更新菌株失败:', error)
      throw error
    }
  }

  /**
   * 删除菌株
   */
  async deleteStrain(id) {
    try {
      // 检查菌株是否存在
      const existingStrain = this.db.getStrainById(id)
      if (!existingStrain) {
        throw new Error('菌株不存在')
      }

      // 检查是否有关联的基因组数据
      const genomes = this.db.getAllGenomes()
      const hasGenomes = genomes.some(genome => genome.strain_id === parseInt(id))
      
      if (hasGenomes) {
        throw new Error('无法删除菌株：存在关联的基因组数据')
      }

      return await this.db.deleteStrain(id)
    } catch (error) {
      console.error('删除菌株失败:', error)
      throw error
    }
  }

  /**
   * 根据条件搜索菌株
   */
  async searchStrains(criteria) {
    try {
      const allStrains = this.db.getAllStrains()
      
      let filteredStrains = allStrains

      // 按名称过滤
      if (criteria.name) {
        filteredStrains = filteredStrains.filter(strain =>
          strain.name.toLowerCase().includes(criteria.name.toLowerCase())
        )
      }

      // 按类型过滤
      if (criteria.type) {
        filteredStrains = filteredStrains.filter(strain =>
          strain.type === criteria.type
        )
      }

      // 按来源过滤
      if (criteria.source) {
        filteredStrains = filteredStrains.filter(strain =>
          strain.source && strain.source.toLowerCase().includes(criteria.source.toLowerCase())
        )
      }

      // 按日期范围过滤
      if (criteria.startDate || criteria.endDate) {
        filteredStrains = filteredStrains.filter(strain => {
          const strainDate = new Date(strain.isolation_date || strain.created_at)
          if (criteria.startDate && strainDate < new Date(criteria.startDate)) {
            return false
          }
          if (criteria.endDate && strainDate > new Date(criteria.endDate)) {
            return false
          }
          return true
        })
      }

      return filteredStrains
    } catch (error) {
      console.error('搜索菌株失败:', error)
      throw new Error('搜索菌株失败')
    }
  }

  /**
   * 获取菌株总数
   */
  async getStrainCount() {
    try {
      return this.db.getStrainCount()
    } catch (error) {
      console.error('获取菌株数量失败:', error)
      throw new Error('获取菌株数量失败')
    }
  }

  /**
   * 获取菌株统计信息
   */
  async getStrainStats() {
    try {
      const allStrains = this.db.getAllStrains()

      const stats = {
        total: allStrains.length,
        bySpecies: {},
        bySource: {},
        byRegion: {},
        recentCount: 0
      }

      // 按菌种统计
      allStrains.forEach(strain => {
        const species = strain.species || 'Unknown'
        stats.bySpecies[species] = (stats.bySpecies[species] || 0) + 1
      })

      // 按来源统计
      allStrains.forEach(strain => {
        const source = strain.sample_source || 'Unknown'
        stats.bySource[source] = (stats.bySource[source] || 0) + 1
      })

      // 按地区统计
      allStrains.forEach(strain => {
        const region = strain.region || 'Unknown'
        stats.byRegion[region] = (stats.byRegion[region] || 0) + 1
      })

      // 统计最近30天的菌株数量
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      stats.recentCount = allStrains.filter(strain => {
        const createdDate = new Date(strain.created_at)
        return createdDate >= thirtyDaysAgo
      }).length

      return stats
    } catch (error) {
      console.error('获取菌株统计失败:', error)
      throw new Error('获取菌株统计失败')
    }
  }

  /**
   * 获取最近的菌株记录
   */
  async getRecentStrains(limit = 10) {
    try {
      const allStrains = this.db.getAllStrains()

      // 按创建时间排序，返回最新的记录
      return allStrains
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, limit)
    } catch (error) {
      console.error('获取最近菌株记录失败:', error)
      throw new Error('获取最近菌株记录失败')
    }
  }

  /**
   * 批量创建菌株
   */
  async batchCreateStrains(strainsData) {
    try {
      const results = []
      const errors = []

      // 开始事务
      this.db.db.run('BEGIN TRANSACTION')

      try {
        for (let i = 0; i < strainsData.length; i++) {
          const strainData = strainsData[i]

          try {
            // 验证必填字段
            if (!strainData.strain_id) {
              throw new Error(`第${i + 1}行：菌株编号不能为空`)
            }

            // 检查菌株编号是否已存在
            const existingStrain = this.db.getStrainByStrainId(strainData.strain_id)
            if (existingStrain) {
              throw new Error(`第${i + 1}行：菌株编号 ${strainData.strain_id} 已存在`)
            }

            // 创建菌株
            const result = await this.createStrain(strainData)
            results.push(result)
          } catch (error) {
            errors.push({
              row: i + 1,
              data: strainData,
              error: error.message
            })
          }
        }

        // 如果有错误，回滚事务
        if (errors.length > 0) {
          this.db.db.run('ROLLBACK')
          throw new Error(`批量导入失败，共 ${errors.length} 条记录有错误`)
        }

        // 提交事务
        this.db.db.run('COMMIT')

        return {
          success: true,
          created: results.length,
          results: results,
          errors: []
        }
      } catch (error) {
        this.db.db.run('ROLLBACK')
        throw error
      }
    } catch (error) {
      console.error('批量创建菌株失败:', error)
      throw new Error('批量创建菌株失败: ' + error.message)
    }
  }

  /**
   * 批量导入菌株
   */
  async importStrains(strainsData) {
    try {
      const results = {
        success: 0,
        failed: 0,
        errors: []
      }

      for (const strainData of strainsData) {
        try {
          await this.createStrain(strainData)
          results.success++
        } catch (error) {
          results.failed++
          results.errors.push({
            strain: strainData.name || 'Unknown',
            error: error.message
          })
        }
      }

      return results
    } catch (error) {
      console.error('批量导入菌株失败:', error)
      throw new Error('批量导入菌株失败')
    }
  }

  /**
   * 验证菌株数据
   */
  validateStrainData(strainData, isCreate = true) {
    if (isCreate && !strainData.strain_id) {
      throw new Error('菌株编号不能为空')
    }

    if (strainData.strain_id && typeof strainData.strain_id !== 'string') {
      throw new Error('菌株编号必须是字符串')
    }

    if (strainData.strain_id && strainData.strain_id.trim().length === 0) {
      throw new Error('菌株编号不能为空')
    }

    if (isCreate && !strainData.species) {
      throw new Error('菌种不能为空')
    }

    if (strainData.species && typeof strainData.species !== 'string') {
      throw new Error('菌种必须是字符串')
    }

    if (strainData.species && strainData.species.trim().length === 0) {
      throw new Error('菌种不能为空')
    }

    if (strainData.isolation_date && !this.isValidDate(strainData.isolation_date)) {
      throw new Error('分离日期格式无效')
    }

    if (strainData.sampling_date && !this.isValidDate(strainData.sampling_date)) {
      throw new Error('采样日期格式无效')
    }

    if (strainData.onset_date && !this.isValidDate(strainData.onset_date)) {
      throw new Error('发病日期格式无效')
    }
  }

  /**
   * 验证日期格式
   */
  isValidDate(dateString) {
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }
}

module.exports = StrainService 