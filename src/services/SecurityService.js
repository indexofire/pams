/**
 * 安全服务
 * 提供输入验证、SQL注入防护、文件上传安全等功能
 */

const crypto = require('crypto')
const path = require('path')

class SecurityService {
  constructor () {
    // 危险的SQL关键字
    this.sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(;|\||&|\$|`|'|"|\\|\*|\?|<|>|\{|\}|\[|\]|\(|\))/,
      /(\b(OR|AND)\b.*=.*)/i,
      /(--|\#|\/\*|\*\/)/
    ]

    // 危险的文件扩展名
    this.dangerousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
      '.php', '.asp', '.aspx', '.jsp', '.py', '.rb', '.pl', '.sh'
    ]

    // 允许的基因组文件扩展名
    this.allowedGenomeExtensions = [
      '.fasta', '.fa', '.fna', '.fas', '.seq', '.txt', '.gz'
    ]

    // XSS防护模式
    this.xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi
    ]

    // 文件大小限制（字节）
    this.fileSizeLimits = {
      genome: 100 * 1024 * 1024, // 100MB
      image: 5 * 1024 * 1024,    // 5MB
      document: 10 * 1024 * 1024  // 10MB
    }
  }

  /**
   * SQL注入检测
   */
  detectSQLInjection (input) {
    if (typeof input !== 'string') {
      return false
    }

    return this.sqlInjectionPatterns.some(pattern => pattern.test(input))
  }

  /**
   * 清理SQL输入
   */
  sanitizeSQLInput (input) {
    if (typeof input !== 'string') {
      return input
    }

    // 转义单引号
    return input.replace(/'/g, "''")
  }

  /**
   * XSS检测
   */
  detectXSS (input) {
    if (typeof input !== 'string') {
      return false
    }

    return this.xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * 清理XSS输入
   */
  sanitizeXSS (input) {
    if (typeof input !== 'string') {
      return input
    }

    let sanitized = input
    this.xssPatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '')
    })

    // HTML实体编码
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')

    return sanitized
  }

  /**
   * 验证用户名
   */
  validateUsername (username) {
    const errors = []

    if (!username || typeof username !== 'string') {
      errors.push('用户名不能为空')
      return { valid: false, errors }
    }

    // 长度检查
    if (username.length < 3 || username.length > 20) {
      errors.push('用户名长度必须在3-20个字符之间')
    }

    // 字符检查（只允许字母、数字、下划线）
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.push('用户名只能包含字母、数字和下划线')
    }

    // SQL注入检查
    if (this.detectSQLInjection(username)) {
      errors.push('用户名包含非法字符')
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: this.sanitizeSQLInput(username)
    }
  }

  /**
   * 验证密码强度
   */
  validatePassword (password) {
    const errors = []

    if (!password || typeof password !== 'string') {
      errors.push('密码不能为空')
      return { valid: false, errors }
    }

    // 长度检查
    if (password.length < 8) {
      errors.push('密码长度不能少于8个字符')
    }

    if (password.length > 128) {
      errors.push('密码长度不能超过128个字符')
    }

    // 复杂度检查
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    let complexity = 0
    if (hasLowerCase) complexity++
    if (hasUpperCase) complexity++
    if (hasNumbers) complexity++
    if (hasSpecialChar) complexity++

    if (complexity < 3) {
      errors.push('密码必须包含至少3种类型的字符（大写字母、小写字母、数字、特殊字符）')
    }

    // 常见密码检查
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'admin123', '111111', '000000'
    ]

    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('不能使用常见密码')
    }

    return {
      valid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    }
  }

  /**
   * 计算密码强度
   */
  calculatePasswordStrength (password) {
    let score = 0

    // 长度加分
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1

    // 字符类型加分
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1

    // 复杂模式加分
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) score += 1

    if (score <= 2) return 'weak'
    if (score <= 4) return 'medium'
    if (score <= 6) return 'strong'
    return 'very_strong'
  }

  /**
   * 验证邮箱
   */
  validateEmail (email) {
    const errors = []

    if (!email || typeof email !== 'string') {
      errors.push('邮箱不能为空')
      return { valid: false, errors }
    }

    // 邮箱格式检查
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('邮箱格式无效')
    }

    // 长度检查
    if (email.length > 254) {
      errors.push('邮箱长度不能超过254个字符')
    }

    // XSS检查
    if (this.detectXSS(email)) {
      errors.push('邮箱包含非法字符')
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitized: this.sanitizeXSS(email)
    }
  }

  /**
   * 验证文件上传
   */
  validateFileUpload (file, fileType = 'genome') {
    const errors = []

    if (!file) {
      errors.push('文件不能为空')
      return { valid: false, errors }
    }

    // 文件大小检查
    const sizeLimit = this.fileSizeLimits[fileType] || this.fileSizeLimits.document
    if (file.size > sizeLimit) {
      errors.push(`文件大小不能超过 ${this.formatFileSize(sizeLimit)}`)
    }

    // 文件扩展名检查
    const ext = path.extname(file.name).toLowerCase()
    
    if (fileType === 'genome') {
      if (!this.allowedGenomeExtensions.includes(ext)) {
        errors.push(`不支持的文件格式，支持的格式: ${this.allowedGenomeExtensions.join(', ')}`)
      }
    }

    // 危险文件检查
    if (this.dangerousExtensions.includes(ext)) {
      errors.push('不允许上传可执行文件')
    }

    // 文件名安全检查
    const fileName = file.name
    if (this.detectXSS(fileName) || this.detectSQLInjection(fileName)) {
      errors.push('文件名包含非法字符')
    }

    // 文件名长度检查
    if (fileName.length > 255) {
      errors.push('文件名长度不能超过255个字符')
    }

    return {
      valid: errors.length === 0,
      errors,
      sanitizedName: this.sanitizeFileName(fileName)
    }
  }

  /**
   * 清理文件名
   */
  sanitizeFileName (fileName) {
    // 移除危险字符
    let sanitized = fileName.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    
    // 移除多个连续的点
    sanitized = sanitized.replace(/\.{2,}/g, '.')
    
    // 确保不以点开头或结尾
    sanitized = sanitized.replace(/^\.+|\.+$/g, '')
    
    // 如果文件名为空，使用默认名称
    if (!sanitized) {
      sanitized = 'unnamed_file'
    }

    return sanitized
  }

  /**
   * 格式化文件大小
   */
  formatFileSize (bytes) {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  /**
   * 生成安全的随机字符串
   */
  generateSecureToken (length = 32) {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * 生成CSRF令牌
   */
  generateCSRFToken () {
    return this.generateSecureToken(16)
  }

  /**
   * 验证CSRF令牌
   */
  validateCSRFToken (token, sessionToken) {
    return token === sessionToken
  }

  /**
   * 哈希敏感数据
   */
  hashSensitiveData (data) {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  /**
   * 验证输入数据
   */
  validateInput (data, rules) {
    const errors = {}
    let isValid = true

    for (const field in rules) {
      const rule = rules[field]
      const value = data[field]
      const fieldErrors = []

      // 必填检查
      if (rule.required && (!value || value.toString().trim() === '')) {
        fieldErrors.push(`${rule.label || field}不能为空`)
      }

      if (value && value.toString().trim() !== '') {
        // 类型检查
        if (rule.type) {
          switch (rule.type) {
            case 'email':
              const emailValidation = this.validateEmail(value)
              if (!emailValidation.valid) {
                fieldErrors.push(...emailValidation.errors)
              }
              break
            case 'username':
              const usernameValidation = this.validateUsername(value)
              if (!usernameValidation.valid) {
                fieldErrors.push(...usernameValidation.errors)
              }
              break
            case 'password':
              const passwordValidation = this.validatePassword(value)
              if (!passwordValidation.valid) {
                fieldErrors.push(...passwordValidation.errors)
              }
              break
          }
        }

        // 长度检查
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(`${rule.label || field}长度不能少于${rule.minLength}个字符`)
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(`${rule.label || field}长度不能超过${rule.maxLength}个字符`)
        }

        // 正则表达式检查
        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(rule.message || `${rule.label || field}格式无效`)
        }

        // XSS检查
        if (rule.xssCheck !== false && this.detectXSS(value)) {
          fieldErrors.push(`${rule.label || field}包含非法字符`)
        }

        // SQL注入检查
        if (rule.sqlCheck !== false && this.detectSQLInjection(value)) {
          fieldErrors.push(`${rule.label || field}包含非法字符`)
        }
      }

      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
        isValid = false
      }
    }

    return {
      valid: isValid,
      errors
    }
  }

  /**
   * 清理输入数据
   */
  sanitizeInput (data, options = {}) {
    const sanitized = {}

    for (const key in data) {
      const value = data[key]
      
      if (typeof value === 'string') {
        let cleaned = value

        // XSS清理
        if (options.xss !== false) {
          cleaned = this.sanitizeXSS(cleaned)
        }

        // SQL清理
        if (options.sql !== false) {
          cleaned = this.sanitizeSQLInput(cleaned)
        }

        // 去除首尾空格
        if (options.trim !== false) {
          cleaned = cleaned.trim()
        }

        sanitized[key] = cleaned
      } else {
        sanitized[key] = value
      }
    }

    return sanitized
  }
}

module.exports = SecurityService
