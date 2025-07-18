class SystemConfigService {
  constructor(dbService) {
    this.db = dbService
  }

  /**
   * 获取所有系统配置
   */
  async getAllConfig() {
    try {
      const systemConfig = this.db.getSystemConfig()
      const speciesConfig = this.db.getSpeciesConfig()
      const regionsConfig = this.db.getRegionsConfig()
      const sampleSourcesConfig = this.db.getSampleSourcesConfig()

      return {
        system: systemConfig,
        species: speciesConfig,
        regions: regionsConfig,
        sampleSources: sampleSourcesConfig
      }
    } catch (error) {
      console.error('获取系统配置失败:', error)
      throw new Error('获取系统配置失败')
    }
  }

  /**
   * 获取菌种配置
   */
  async getSpeciesConfig() {
    try {
      return this.db.getSpeciesConfig()
    } catch (error) {
      console.error('获取菌种配置失败:', error)
      throw new Error('获取菌种配置失败')
    }
  }

  /**
   * 保存菌种配置
   */
  async saveSpecies(speciesData) {
    try {
      if (speciesData.id) {
        // 更新现有菌种
        const stmt = this.db.db.prepare(`
          UPDATE species_config 
          SET name = ?, scientific_name = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        stmt.run(speciesData.name, speciesData.scientific_name, speciesData.description, speciesData.status, speciesData.id)
        
        return { ...speciesData, updated_at: new Date().toISOString() }
      } else {
        // 创建新菌种
        const stmt = this.db.db.prepare(`
          INSERT INTO species_config (name, scientific_name, description, status, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
          speciesData.name, 
          speciesData.scientific_name, 
          speciesData.description, 
          speciesData.status || 'active',
          speciesData.sort_order || 999
        )
        
        return {
          id: result.lastInsertRowid,
          ...speciesData,
          status: speciesData.status || 'active',
          sort_order: speciesData.sort_order || 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('保存菌种配置失败:', error)
      throw new Error('保存菌种配置失败: ' + error.message)
    }
  }

  /**
   * 删除菌种配置
   */
  async deleteSpecies(id) {
    try {
      const stmt = this.db.db.prepare('UPDATE species_config SET status = ? WHERE id = ?')
      stmt.run('inactive', id)
      return true
    } catch (error) {
      console.error('删除菌种配置失败:', error)
      throw new Error('删除菌种配置失败')
    }
  }

  /**
   * 获取地区配置
   */
  async getRegionsConfig() {
    try {
      return this.db.getRegionsConfig()
    } catch (error) {
      console.error('获取地区配置失败:', error)
      throw new Error('获取地区配置失败')
    }
  }

  /**
   * 保存地区配置
   */
  async saveRegion(regionData) {
    try {
      if (regionData.id) {
        // 更新现有地区
        const stmt = this.db.db.prepare(`
          UPDATE regions_config 
          SET name = ?, code = ?, level = ?, parent_id = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        stmt.run(
          regionData.name, 
          regionData.code, 
          regionData.level, 
          regionData.parent_id, 
          regionData.description, 
          regionData.status, 
          regionData.id
        )
        
        return { ...regionData, updated_at: new Date().toISOString() }
      } else {
        // 创建新地区
        const stmt = this.db.db.prepare(`
          INSERT INTO regions_config (name, code, level, parent_id, description, status, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
          regionData.name, 
          regionData.code, 
          regionData.level || 'city', 
          regionData.parent_id, 
          regionData.description, 
          regionData.status || 'active',
          regionData.sort_order || 999
        )
        
        return {
          id: result.lastInsertRowid,
          ...regionData,
          level: regionData.level || 'city',
          status: regionData.status || 'active',
          sort_order: regionData.sort_order || 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('保存地区配置失败:', error)
      throw new Error('保存地区配置失败: ' + error.message)
    }
  }

  /**
   * 删除地区配置
   */
  async deleteRegion(id) {
    try {
      const stmt = this.db.db.prepare('UPDATE regions_config SET status = ? WHERE id = ?')
      stmt.run('inactive', id)
      return true
    } catch (error) {
      console.error('删除地区配置失败:', error)
      throw new Error('删除地区配置失败')
    }
  }

  /**
   * 获取样本来源配置
   */
  async getSampleSourcesConfig() {
    try {
      return this.db.getSampleSourcesConfig()
    } catch (error) {
      console.error('获取样本来源配置失败:', error)
      throw new Error('获取样本来源配置失败')
    }
  }

  /**
   * 保存样本来源配置
   */
  async saveSampleSource(sourceData) {
    try {
      if (sourceData.id) {
        // 更新现有样本来源
        const stmt = this.db.db.prepare(`
          UPDATE sample_sources_config 
          SET name = ?, category = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
        stmt.run(sourceData.name, sourceData.category, sourceData.description, sourceData.status, sourceData.id)
        
        return { ...sourceData, updated_at: new Date().toISOString() }
      } else {
        // 创建新样本来源
        const stmt = this.db.db.prepare(`
          INSERT INTO sample_sources_config (name, category, description, status, sort_order)
          VALUES (?, ?, ?, ?, ?)
        `)
        const result = stmt.run(
          sourceData.name, 
          sourceData.category, 
          sourceData.description, 
          sourceData.status || 'active',
          sourceData.sort_order || 999
        )
        
        return {
          id: result.lastInsertRowid,
          ...sourceData,
          status: sourceData.status || 'active',
          sort_order: sourceData.sort_order || 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('保存样本来源配置失败:', error)
      throw new Error('保存样本来源配置失败: ' + error.message)
    }
  }

  /**
   * 删除样本来源配置
   */
  async deleteSampleSource(id) {
    try {
      const stmt = this.db.db.prepare('UPDATE sample_sources_config SET status = ? WHERE id = ?')
      stmt.run('inactive', id)
      return true
    } catch (error) {
      console.error('删除样本来源配置失败:', error)
      throw new Error('删除样本来源配置失败')
    }
  }

  /**
   * 更新系统配置
   */
  async updateSystemConfig(configKey, configValue) {
    try {
      const stmt = this.db.db.prepare(`
        UPDATE system_config 
        SET config_value = ?, updated_at = CURRENT_TIMESTAMP
        WHERE config_key = ?
      `)
      stmt.run(configValue, configKey)
      return true
    } catch (error) {
      console.error('更新系统配置失败:', error)
      throw new Error('更新系统配置失败')
    }
  }
}

module.exports = SystemConfigService
