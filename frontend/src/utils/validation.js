/**
 * 前端输入验证工具
 */

// XSS检测模式
const xssPatterns = [
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

// SQL注入检测模式
const sqlInjectionPatterns = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
  /(;|\||&|\$|`|'|"|\\|\*|\?|<|>|\{|\}|\[|\]|\(|\))/,
  /(\b(OR|AND)\b.*=.*)/i,
  /(--|#|\/\*|\*\/)/
]

/**
 * 检测XSS攻击
 */
export function detectXSS (input) {
  if (typeof input !== 'string') {
    return false
  }
  return xssPatterns.some(pattern => pattern.test(input))
}

/**
 * 清理XSS输入
 */
export function sanitizeXSS (input) {
  if (typeof input !== 'string') {
    return input
  }

  let sanitized = input
  xssPatterns.forEach(pattern => {
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
 * 检测SQL注入
 */
export function detectSQLInjection (input) {
  if (typeof input !== 'string') {
    return false
  }
  return sqlInjectionPatterns.some(pattern => pattern.test(input))
}

/**
 * 验证用户名
 */
export function validateUsername (username) {
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

  // XSS检查
  if (detectXSS(username)) {
    errors.push('用户名包含非法字符')
  }

  // SQL注入检查
  if (detectSQLInjection(username)) {
    errors.push('用户名包含非法字符')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证密码强度
 */
export function validatePassword (password) {
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
    strength: calculatePasswordStrength(password)
  }
}

/**
 * 计算密码强度
 */
export function calculatePasswordStrength (password) {
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
export function validateEmail (email) {
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
  if (detectXSS(email)) {
    errors.push('邮箱包含非法字符')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证手机号
 */
export function validatePhone (phone) {
  const errors = []

  if (!phone) {
    return { valid: true, errors } // 手机号可选
  }

  if (typeof phone !== 'string') {
    errors.push('手机号格式无效')
    return { valid: false, errors }
  }

  // 中国手机号格式检查
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    errors.push('请输入有效的手机号')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证菌株编号
 */
export function validateStrainCode (code) {
  const errors = []

  if (!code || typeof code !== 'string') {
    errors.push('菌株编号不能为空')
    return { valid: false, errors }
  }

  // 长度检查
  if (code.length < 2 || code.length > 50) {
    errors.push('菌株编号长度必须在2-50个字符之间')
  }

  // 字符检查（允许字母、数字、连字符、下划线）
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    errors.push('菌株编号只能包含字母、数字、连字符和下划线')
  }

  // 安全检查
  if (detectXSS(code) || detectSQLInjection(code)) {
    errors.push('菌株编号包含非法字符')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证文件名
 */
export function validateFileName (fileName) {
  const errors = []

  if (!fileName || typeof fileName !== 'string') {
    errors.push('文件名不能为空')
    return { valid: false, errors }
  }

  // 长度检查
  if (fileName.length > 255) {
    errors.push('文件名长度不能超过255个字符')
  }

  // 危险字符检查
  // eslint-disable-next-line no-control-regex
  if (/[<>:"/\\|?*\x00-\x1f]/.test(fileName)) {
    errors.push('文件名包含非法字符')
  }

  // 安全检查
  if (detectXSS(fileName) || detectSQLInjection(fileName)) {
    errors.push('文件名包含非法字符')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 通用输入验证
 */
export function validateInput (value, rules) {
  const errors = []

  // 必填检查
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${rules.label || '此字段'}不能为空`)
    return { valid: false, errors }
  }

  if (!value || value.toString().trim() === '') {
    return { valid: true, errors } // 非必填字段为空时通过验证
  }

  const stringValue = value.toString()

  // 长度检查
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${rules.label || '此字段'}长度不能少于${rules.minLength}个字符`)
  }

  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${rules.label || '此字段'}长度不能超过${rules.maxLength}个字符`)
  }

  // 正则表达式检查
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.message || `${rules.label || '此字段'}格式无效`)
  }

  // 安全检查
  if (rules.xssCheck !== false && detectXSS(stringValue)) {
    errors.push(`${rules.label || '此字段'}包含非法字符`)
  }

  if (rules.sqlCheck !== false && detectSQLInjection(stringValue)) {
    errors.push(`${rules.label || '此字段'}包含非法字符`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 清理输入数据
 */
export function sanitizeInput (input) {
  if (typeof input !== 'string') {
    return input
  }

  // 去除首尾空格
  let cleaned = input.trim()

  // XSS清理
  cleaned = sanitizeXSS(cleaned)

  return cleaned
}

export default {
  detectXSS,
  sanitizeXSS,
  detectSQLInjection,
  validateUsername,
  validatePassword,
  calculatePasswordStrength,
  validateEmail,
  validatePhone,
  validateStrainCode,
  validateFileName,
  validateInput,
  sanitizeInput
}
