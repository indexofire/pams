/**
 * 安全审计服务
 * 记录系统操作和安全事件
 */

class AuditService {
  constructor (databaseService) {
    this.db = databaseService
    this.initializeAuditTables()
  }

  /**
   * 初始化审计表
   */
  initializeAuditTables () {
    try {
      // 创建审计日志表
      this.db.db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp TEXT NOT NULL,
          event_type TEXT NOT NULL,
          username TEXT,
          user_id INTEGER,
          action TEXT NOT NULL,
          resource TEXT,
          resource_id TEXT,
          result TEXT NOT NULL,
          ip_address TEXT,
          user_agent TEXT,
          session_id TEXT,
          details TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // 创建索引
      this.db.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
        CREATE INDEX IF NOT EXISTS idx_audit_event_type ON audit_logs(event_type);
        CREATE INDEX IF NOT EXISTS idx_audit_username ON audit_logs(username);
        CREATE INDEX IF NOT EXISTS idx_audit_result ON audit_logs(result);
      `)

      console.log('审计表初始化完成')
    } catch (error) {
      console.error('初始化审计表失败:', error)
    }
  }

  /**
   * 记录审计日志
   */
  async logEvent (eventData) {
    try {
      const {
        eventType,
        username,
        userId,
        action,
        resource,
        resourceId,
        result,
        ipAddress,
        userAgent,
        sessionId,
        details
      } = eventData

      const stmt = this.db.db.prepare(`
        INSERT INTO audit_logs (
          timestamp, event_type, username, user_id, action, 
          resource, resource_id, result, ip_address, user_agent, 
          session_id, details
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const timestamp = new Date().toISOString()
      const detailsJson = details ? JSON.stringify(details) : null

      stmt.run(
        timestamp,
        eventType,
        username,
        userId,
        action,
        resource,
        resourceId,
        result,
        ipAddress,
        userAgent,
        sessionId,
        detailsJson
      )

      console.log('审计日志记录成功:', { eventType, username, action, result })
    } catch (error) {
      console.error('记录审计日志失败:', error)
    }
  }

  /**
   * 记录登录事件
   */
  async logLogin (username, userId, result, ipAddress, userAgent, sessionId, details = {}) {
    await this.logEvent({
      eventType: 'login',
      username,
      userId,
      action: result === 'success' ? '用户登录成功' : '用户登录失败',
      resource: 'auth',
      result,
      ipAddress,
      userAgent,
      sessionId,
      details
    })
  }

  /**
   * 记录登出事件
   */
  async logLogout (username, userId, ipAddress, userAgent, sessionId) {
    await this.logEvent({
      eventType: 'login',
      username,
      userId,
      action: '用户登出',
      resource: 'auth',
      result: 'success',
      ipAddress,
      userAgent,
      sessionId
    })
  }

  /**
   * 记录权限变更事件
   */
  async logPermissionChange (username, userId, action, targetUser, details, ipAddress, userAgent) {
    await this.logEvent({
      eventType: 'permission',
      username,
      userId,
      action,
      resource: 'user',
      resourceId: targetUser,
      result: 'success',
      ipAddress,
      userAgent,
      details
    })
  }

  /**
   * 记录数据操作事件
   */
  async logDataOperation (username, userId, action, resource, resourceId, result, details, ipAddress, userAgent) {
    await this.logEvent({
      eventType: 'data',
      username,
      userId,
      action,
      resource,
      resourceId,
      result,
      ipAddress,
      userAgent,
      details
    })
  }

  /**
   * 记录安全事件
   */
  async logSecurityEvent (username, action, details, ipAddress, userAgent, sessionId) {
    await this.logEvent({
      eventType: 'security',
      username,
      action,
      resource: 'security',
      result: 'warning',
      ipAddress,
      userAgent,
      sessionId,
      details
    })
  }

  /**
   * 记录系统操作事件
   */
  async logSystemOperation (username, userId, action, details, ipAddress, userAgent) {
    await this.logEvent({
      eventType: 'system',
      username,
      userId,
      action,
      resource: 'system',
      result: 'success',
      ipAddress,
      userAgent,
      details
    })
  }

  /**
   * 获取审计日志
   */
  getAuditLogs (filters = {}, pagination = {}) {
    try {
      const {
        eventType,
        username,
        startDate,
        endDate,
        result
      } = filters

      const {
        page = 1,
        pageSize = 20
      } = pagination

      let whereClause = 'WHERE 1=1'
      const params = []

      if (eventType) {
        whereClause += ' AND event_type = ?'
        params.push(eventType)
      }

      if (username) {
        whereClause += ' AND username LIKE ?'
        params.push(`%${username}%`)
      }

      if (startDate) {
        whereClause += ' AND timestamp >= ?'
        params.push(startDate)
      }

      if (endDate) {
        whereClause += ' AND timestamp <= ?'
        params.push(endDate)
      }

      if (result) {
        whereClause += ' AND result = ?'
        params.push(result)
      }

      // 获取总数
      const countStmt = this.db.db.prepare(`
        SELECT COUNT(*) as total FROM audit_logs ${whereClause}
      `)
      const { total } = countStmt.get(...params)

      // 获取分页数据
      const offset = (page - 1) * pageSize
      const dataStmt = this.db.db.prepare(`
        SELECT * FROM audit_logs ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ? OFFSET ?
      `)

      const logs = dataStmt.all(...params, pageSize, offset)

      // 解析details字段
      const processedLogs = logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }))

      return {
        logs: processedLogs,
        total,
        page,
        pageSize
      }
    } catch (error) {
      console.error('获取审计日志失败:', error)
      throw new Error('获取审计日志失败')
    }
  }

  /**
   * 获取审计统计信息
   */
  getAuditStats (timeRange = '24h') {
    try {
      let timeCondition = ''
      const now = new Date()

      switch (timeRange) {
        case '1h':
          timeCondition = `timestamp >= '${new Date(now.getTime() - 60 * 60 * 1000).toISOString()}'`
          break
        case '24h':
          timeCondition = `timestamp >= '${new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()}'`
          break
        case '7d':
          timeCondition = `timestamp >= '${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}'`
          break
        case '30d':
          timeCondition = `timestamp >= '${new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()}'`
          break
        default:
          timeCondition = '1=1'
      }

      // 总事件数
      const totalEventsStmt = this.db.db.prepare(`
        SELECT COUNT(*) as count FROM audit_logs WHERE ${timeCondition}
      `)
      const totalEvents = totalEventsStmt.get().count

      // 安全事件数
      const securityEventsStmt = this.db.db.prepare(`
        SELECT COUNT(*) as count FROM audit_logs 
        WHERE ${timeCondition} AND event_type = 'security'
      `)
      const securityEvents = securityEventsStmt.get().count

      // 登录失败次数
      const failedLoginsStmt = this.db.db.prepare(`
        SELECT COUNT(*) as count FROM audit_logs 
        WHERE ${timeCondition} AND event_type = 'login' AND result = 'failure'
      `)
      const failedLogins = failedLoginsStmt.get().count

      // 活跃用户数
      const activeUsersStmt = this.db.db.prepare(`
        SELECT COUNT(DISTINCT username) as count FROM audit_logs 
        WHERE ${timeCondition} AND username IS NOT NULL
      `)
      const activeUsers = activeUsersStmt.get().count

      return {
        totalEvents,
        securityEvents,
        failedLogins,
        activeUsers
      }
    } catch (error) {
      console.error('获取审计统计失败:', error)
      throw new Error('获取审计统计失败')
    }
  }

  /**
   * 清理过期日志
   */
  cleanupOldLogs (retentionDays = 90) {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      const stmt = this.db.db.prepare(`
        DELETE FROM audit_logs WHERE timestamp < ?
      `)

      const result = stmt.run(cutoffDate.toISOString())
      console.log(`清理了 ${result.changes} 条过期审计日志`)

      return result.changes
    } catch (error) {
      console.error('清理审计日志失败:', error)
      throw new Error('清理审计日志失败')
    }
  }

  /**
   * 导出审计日志
   */
  exportAuditLogs (filters = {}, format = 'json') {
    try {
      const { logs } = this.getAuditLogs(filters, { page: 1, pageSize: 10000 })

      if (format === 'csv') {
        // 转换为CSV格式
        const headers = [
          'timestamp', 'event_type', 'username', 'action', 'resource',
          'result', 'ip_address', 'user_agent', 'details'
        ]

        const csvContent = [
          headers.join(','),
          ...logs.map(log => [
            log.timestamp,
            log.event_type,
            log.username || '',
            log.action,
            log.resource || '',
            log.result,
            log.ip_address || '',
            log.user_agent || '',
            log.details ? JSON.stringify(log.details) : ''
          ].map(field => `"${field}"`).join(','))
        ].join('\n')

        return csvContent
      }

      // 默认返回JSON格式
      return JSON.stringify(logs, null, 2)
    } catch (error) {
      console.error('导出审计日志失败:', error)
      throw new Error('导出审计日志失败')
    }
  }

  /**
   * 检测异常行为
   */
  detectAnomalies () {
    try {
      const anomalies = []
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

      // 检测频繁登录失败
      const failedLoginsStmt = this.db.db.prepare(`
        SELECT username, ip_address, COUNT(*) as count
        FROM audit_logs 
        WHERE timestamp >= ? AND event_type = 'login' AND result = 'failure'
        GROUP BY username, ip_address
        HAVING count >= 5
      `)

      const frequentFailures = failedLoginsStmt.all(oneHourAgo)
      frequentFailures.forEach(failure => {
        anomalies.push({
          type: 'frequent_login_failures',
          severity: 'high',
          description: `用户 ${failure.username} 从 IP ${failure.ip_address} 在1小时内登录失败 ${failure.count} 次`,
          details: failure
        })
      })

      // 检测异常IP访问
      const unusualIPStmt = this.db.db.prepare(`
        SELECT ip_address, COUNT(DISTINCT username) as user_count, COUNT(*) as event_count
        FROM audit_logs 
        WHERE timestamp >= ?
        GROUP BY ip_address
        HAVING user_count >= 5 OR event_count >= 100
      `)

      const unusualIPs = unusualIPStmt.all(oneHourAgo)
      unusualIPs.forEach(ip => {
        anomalies.push({
          type: 'unusual_ip_activity',
          severity: 'medium',
          description: `IP ${ip.ip_address} 在1小时内访问了 ${ip.user_count} 个用户账户，产生 ${ip.event_count} 个事件`,
          details: ip
        })
      })

      return anomalies
    } catch (error) {
      console.error('检测异常行为失败:', error)
      return []
    }
  }
}

module.exports = AuditService
