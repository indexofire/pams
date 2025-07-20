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
      // 确保参数有效
      if (!username || !password) {
        throw new Error('用户名和密码不能为空')
      }

      let user = this.db.getUserByUsername(username)
      console.log('查询用户结果:', user)

      // 如果数据库中没有用户，创建默认管理员用户
      if (!user && username === 'admin') {
        console.log('创建默认管理员用户')
        const hashedPassword = await bcrypt.hash('admin123', 10)
        const adminUser = {
          username: 'admin',
          password: hashedPassword,
          email: 'admin@pams.local',
          role: 'admin',
          isActive: 1,
          createdAt: new Date().toISOString()
        }

        try {
          const userId = await this.db.createUser(adminUser)
          console.log('创建用户ID:', userId)
          user = this.db.getUserByUsername(username) // 重新查询用户
          console.log('重新查询用户结果:', user)
        } catch (createError) {
          console.error('创建默认用户失败:', createError)
          throw new Error('系统初始化失败')
        }
      }

      if (!user) {
        throw new Error('用户名不存在')
      }

      // 检查用户密码字段
      if (!user.password) {
        console.error('用户密码字段为空:', user)
        throw new Error('用户数据异常，请联系管理员')
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
      try {
        await this.db.updateUser(user.id, {
          lastLogin: new Date().toISOString()
        })
      } catch (updateError) {
        console.warn('更新登录时间失败:', updateError)
        // 不阻止登录流程
      }

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
   * 更改密码
   */
  async changePassword(username, currentPassword, newPassword) {
    try {
      const user = this.db.getUserByUsername(username)
      if (!user) {
        throw new Error('用户不存在')
      }

      // 验证当前密码
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
      if (!isPasswordValid) {
        throw new Error('当前密码不正确')
      }

      // 验证新密码
      if (!newPassword || newPassword.length < 6) {
        throw new Error('新密码长度不能少于6个字符')
      }

      // 加密新密码
      const hashedNewPassword = await bcrypt.hash(newPassword, 10)

      // 更新密码
      return await this.db.updateUser(user.id, {
        password: hashedNewPassword,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('更改密码失败:', error)
      throw error
    }
  }

  /**
   * 更新用户资料
   */
  async updateUserProfile(userId, profileData) {
    try {
      // 检查用户是否存在
      const existingUser = this.db.getUserById(userId)
      if (!existingUser) {
        throw new Error('用户不存在')
      }

      // 验证邮箱格式（如果提供了邮箱）
      if (profileData.email && !this.isValidEmail(profileData.email)) {
        throw new Error('邮箱格式无效')
      }

      // 检查邮箱是否与其他用户重复
      if (profileData.email) {
        const allUsers = this.db.getUsers()
        const emailExists = allUsers.some(user =>
          user.id !== parseInt(userId) &&
          user.email === profileData.email
        )

        if (emailExists) {
          throw new Error('邮箱已存在')
        }
      }

      // 准备更新数据
      const updateData = {
        displayName: profileData.displayName,
        laboratory: profileData.laboratory,
        email: profileData.email,
        phone: profileData.phone,
        updatedAt: new Date().toISOString()
      }

      // 移除空值
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key]
        }
      })

      return await this.db.updateUser(userId, updateData)
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  }

  /**
   * 更新用户设置
   */
  async updateUserSettings(userId, settingsData) {
    try {
      // 检查用户是否存在
      const existingUser = this.db.getUserById(userId)
      if (!existingUser) {
        throw new Error('用户不存在')
      }

      // 准备更新数据
      const updateData = {
        language: settingsData.language,
        timezone: settingsData.timezone,
        theme: settingsData.theme,
        showAdvancedData: settingsData.showAdvancedData,
        updatedAt: new Date().toISOString()
      }

      // 移除空值
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key]
        }
      })

      return await this.db.updateUser(userId, updateData)
    } catch (error) {
      console.error('更新用户设置失败:', error)
      throw error
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