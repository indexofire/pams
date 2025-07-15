const bcrypt = require('bcryptjs')

class UserService {
  constructor(databaseService) {
    this.db = databaseService
  }

  /**
   * 获取所有用户
   */
  async getAllUsers() {
    try {
      return this.db.getUsers()
    } catch (error) {
      console.error('获取用户列表失败:', error)
      throw new Error('获取用户列表失败')
    }
  }

  /**
   * 根据ID获取用户
   */
  async getUserById(id) {
    try {
      return this.db.getUserById(id)
    } catch (error) {
      console.error('获取用户详情失败:', error)
      throw new Error('获取用户详情失败')
    }
  }

  /**
   * 创建新用户
   */
  async createUser(userData) {
    try {
      // 验证必要字段
      this.validateUserData(userData)
      
      // 检查用户名是否重复
      const existingUser = this.db.getUserByUsername(userData.username)
      if (existingUser) {
        throw new Error('用户名已存在')
      }

      // 检查邮箱是否重复（如果提供了邮箱）
      if (userData.email) {
        const existingUsers = this.db.getUsers()
        const emailExists = existingUsers.some(user => 
          user.email === userData.email
        )
        
        if (emailExists) {
          throw new Error('邮箱已存在')
        }
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(userData.password, 10)

      // 准备用户数据
      const userWithHashedPassword = {
        ...userData,
        password: hashedPassword,
        email: userData.email || `${userData.username}@pams.local`,
        role: userData.role || 'user'
      }

      return await this.db.createUser(userWithHashedPassword)
    } catch (error) {
      console.error('创建用户失败:', error)
      throw error
    }
  }

  /**
   * 更新用户信息
   */
  async updateUser(id, userData) {
    try {
      // 验证必要字段
      this.validateUserData(userData, false)
      
      // 检查用户是否存在
      const existingUser = this.db.getUserById(id)
      if (!existingUser) {
        throw new Error('用户不存在')
      }

      // 检查用户名是否与其他用户重复
      if (userData.username) {
        const allUsers = this.db.getUsers()
        const usernameExists = allUsers.some(user => 
          user.id !== parseInt(id) && 
          user.username === userData.username
        )
        
        if (usernameExists) {
          throw new Error('用户名已存在')
        }
      }

      // 检查邮箱是否与其他用户重复
      if (userData.email) {
        const allUsers = this.db.getUsers()
        const emailExists = allUsers.some(user => 
          user.id !== parseInt(id) && 
          user.email === userData.email
        )
        
        if (emailExists) {
          throw new Error('邮箱已存在')
        }
      }

      // 如果需要更新密码，先加密
      const processedData = { ...userData }
      if (userData.password) {
        processedData.password = await bcrypt.hash(userData.password, 10)
      } else {
        // 如果没有提供密码，删除密码字段以避免覆盖
        delete processedData.password
      }

      return await this.db.updateUser(id, processedData)
    } catch (error) {
      console.error('更新用户失败:', error)
      throw error
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id) {
    try {
      // 检查用户是否存在
      const existingUser = this.db.getUserById(id)
      if (!existingUser) {
        throw new Error('用户不存在')
      }

      // 防止删除admin用户
      if (existingUser.username === 'admin') {
        throw new Error('无法删除管理员用户')
      }

      return await this.db.deleteUser(id)
    } catch (error) {
      console.error('删除用户失败:', error)
      throw error
    }
  }

  /**
   * 用户登录验证
   */
  async login(username, password) {
    try {
      const user = this.db.getUserByUsername(username)
      if (!user) {
        throw new Error('用户名不存在')
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid) {
        throw new Error('密码错误')
      }

      // 检查用户状态
      if (!user.isActive) {
        throw new Error('用户已被禁用')
      }

      // 更新最后登录时间
      await this.db.updateUser(user.id, { 
        lastLogin: new Date().toISOString() 
      })

      // 返回用户信息（不包含密码）
      const { password: _, ...userInfo } = user
      return {
        ...userInfo,
        permissions: this.getUserPermissions(user.role),
        token: this.generateToken(user.id)
      }
    } catch (error) {
      console.error('用户登录失败:', error)
      throw error
    }
  }

  /**
   * 用户注册
   */
  async register(userData) {
    try {
      return await this.createUser(userData)
    } catch (error) {
      console.error('用户注册失败:', error)
      throw error
    }
  }

  /**
   * 获取用户权限
   */
  getUserPermissions(role) {
    const permissionMap = {
      admin: ['read', 'write', 'delete', 'admin'],
      advanced: ['read', 'write'],
      user: ['read']
    }
    return permissionMap[role] || ['read']
  }

  /**
   * 生成简单的token
   */
  generateToken(userId) {
    return `pams-token-${userId}-${Date.now()}`
  }

  /**
   * 验证用户数据
   */
  validateUserData(userData, isCreate = true) {
    if (isCreate && !userData.username) {
      throw new Error('用户名不能为空')
    }

    if (userData.username && typeof userData.username !== 'string') {
      throw new Error('用户名必须是字符串')
    }

    if (userData.username && userData.username.trim().length === 0) {
      throw new Error('用户名不能为空')
    }

    if (userData.username && (userData.username.length < 3 || userData.username.length > 20)) {
      throw new Error('用户名长度必须在3-20个字符之间')
    }

    if (isCreate && !userData.password) {
      throw new Error('密码不能为空')
    }

    if (userData.password && typeof userData.password !== 'string') {
      throw new Error('密码必须是字符串')
    }

    if (userData.password && userData.password.length < 6) {
      throw new Error('密码长度不能少于6个字符')
    }

    if (userData.email && typeof userData.email !== 'string') {
      throw new Error('邮箱必须是字符串')
    }

    if (userData.email && !this.isValidEmail(userData.email)) {
      throw new Error('邮箱格式无效')
    }

    if (userData.role && !['admin', 'advanced', 'user'].includes(userData.role)) {
      throw new Error('用户角色无效')
    }
  }

  /**
   * 验证邮箱格式
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
}

module.exports = UserService 