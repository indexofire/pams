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
      
      // 检查菌株名称是否重复
      const existingStrains = this.db.getAllStrains()
      const nameExists = existingStrains.some(strain => 
        strain.name.toLowerCase() === strainData.name.toLowerCase()
      )
      
      if (nameExists) {
        throw new Error('菌株名称已存在')
      }

      // 添加创建时间
      const strainWithTimestamp = {
        ...strainData,
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

      // 添加更新时间
      const strainWithTimestamp = {
        ...strainData,
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
   * 获取菌株统计信息
   */
  async getStrainStats() {
    try {
      const allStrains = this.db.getAllStrains()
      
      const stats = {
        total: allStrains.length,
        byType: {},
        bySource: {},
        recentCount: 0
      }

      // 按类型统计
      allStrains.forEach(strain => {
        const type = strain.type || 'Unknown'
        stats.byType[type] = (stats.byType[type] || 0) + 1
      })

      // 按来源统计
      allStrains.forEach(strain => {
        const source = strain.source || 'Unknown'
        stats.bySource[source] = (stats.bySource[source] || 0) + 1
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
    if (isCreate && !strainData.name) {
      throw new Error('菌株名称不能为空')
    }

    if (strainData.name && typeof strainData.name !== 'string') {
      throw new Error('菌株名称必须是字符串')
    }

    if (strainData.name && strainData.name.trim().length === 0) {
      throw new Error('菌株名称不能为空')
    }

    if (strainData.type && !['bacteria', 'fungi', 'virus'].includes(strainData.type)) {
      throw new Error('菌株类型无效')
    }

    if (strainData.isolation_date && !this.isValidDate(strainData.isolation_date)) {
      throw new Error('分离日期格式无效')
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