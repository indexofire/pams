# 用户

## 默认管理员账号信息

系统中预设了3个默认用户：

1. 管理员账号
用户名: admin
密码: admin123
角色: admin
权限: ['read', 'write', 'delete', 'admin']（完全管理权限）

2. 高级用户账号
用户名: advanced
密码: advanced123
角色: advanced
权限: ['read', 'write']（读写权限）

3. 普通用户账号
用户名: user
密码: user123
角色: user
权限: ['read']（只读权限）

## 使用说明

访问系统: 打开 http://localhost:8080

管理员登录: 使用 admin / admin123 进行登录

功能权限: 管理员账号拥有所有权限，包括：

- 用户管理
- 系统设置
- 菌株管理
- 基因组分析
- 报告生成
- 所有的增删改查操作

代码位置

这些默认用户定义在 frontend/src/store/modules/auth.js 文件的 simulateLogin 函数中，用于开发和测试阶段的认证模拟。

注意: 这些是开发阶段的模拟用户，在生产环境中应该连接实际的数据库和认证系统。