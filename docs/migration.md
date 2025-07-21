# PAMS 数据库迁移指南

## 概述

PAMS 系统采用自动化数据库迁移机制来处理软件更新时的数据库结构变更。本文档详细说明如何创建、执行和管理数据库迁移。

## 迁移系统架构

### 核心组件
- **MigrationService**: 迁移服务主类 (`src/services/MigrationService.js`)
- **migrations 表**: 记录已执行的迁移历史
- **版本控制**: 基于语义化版本号的迁移管理

### 迁移表结构
```sql
CREATE TABLE migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  version TEXT UNIQUE NOT NULL,        -- 版本号 (如: 1.0.1)
  name TEXT NOT NULL,                  -- 迁移名称
  executed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  checksum TEXT                        -- 迁移内容校验和
)
```

## 创建新迁移

### 1. 迁移命名规范
- **版本号**: 使用语义化版本 (如: 1.0.1, 1.1.0, 2.0.0)
- **名称**: 使用下划线分隔的描述性名称
- **示例**: `1.0.5_add_user_avatar_field`

### 2. 迁移代码结构
在 `MigrationService.js` 的 `getMigrations()` 方法中添加新迁移：

```javascript
{
  version: '1.0.5',
  name: 'add_user_avatar_field',
  description: '为用户表添加头像字段',
  up: () => {
    try {
      // 执行迁移的SQL语句
      this.db.db.run('ALTER TABLE users ADD COLUMN avatar TEXT')
      console.log('用户头像字段添加成功')
    } catch (error) {
      // 处理已存在字段的情况
      if (error.message.includes('duplicate column name')) {
        console.log('用户头像字段已存在，跳过')
      } else {
        throw error
      }
    }
  }
}
```

## 常见迁移场景

### 1. 添加新字段

```javascript
{
  version: '1.0.6',
  name: 'add_strain_isolation_method',
  description: '为菌株表添加分离方法字段',
  up: () => {
    try {
      this.db.db.run(`
        ALTER TABLE strains 
        ADD COLUMN isolation_method TEXT DEFAULT 'unknown'
      `)
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error
      }
    }
  }
}
```

### 2. 创建新表

```javascript
{
  version: '1.1.0',
  name: 'create_experiment_protocols_table',
  description: '创建实验协议表',
  up: () => {
    this.db.db.run(`
      CREATE TABLE IF NOT EXISTS experiment_protocols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        protocol_file TEXT,
        created_by INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `)
  }
}
```

### 3. 添加索引

```javascript
{
  version: '1.0.7',
  name: 'add_performance_indexes',
  description: '添加性能优化索引',
  up: () => {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_strains_isolation_date ON strains(isolation_date)',
      'CREATE INDEX IF NOT EXISTS idx_genomes_file_size ON genomes(file_size)',
      'CREATE INDEX IF NOT EXISTS idx_analysis_results_confidence ON mlst_results(confidence)'
    ]
    
    indexes.forEach(sql => {
      try {
        this.db.db.run(sql)
      } catch (error) {
        console.warn(`创建索引失败: ${error.message}`)
      }
    })
  }
}
```

### 4. 修改字段类型

```javascript
{
  version: '1.1.1',
  name: 'modify_strain_id_to_varchar',
  description: '修改菌株ID字段类型',
  up: () => {
    // SQLite不支持直接修改字段类型，需要重建表
    this.db.db.run('BEGIN TRANSACTION')
    
    try {
      // 1. 创建新表
      this.db.db.run(`
        CREATE TABLE strains_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          strain_id VARCHAR(50) UNIQUE NOT NULL,
          strain_name TEXT NOT NULL,
          species TEXT,
          region TEXT,
          sample_source TEXT,
          isolation_date TEXT,
          description TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
      `)
      
      // 2. 复制数据
      this.db.db.run(`
        INSERT INTO strains_new 
        SELECT * FROM strains
      `)
      
      // 3. 删除旧表
      this.db.db.run('DROP TABLE strains')
      
      // 4. 重命名新表
      this.db.db.run('ALTER TABLE strains_new RENAME TO strains')
      
      this.db.db.run('COMMIT')
    } catch (error) {
      this.db.db.run('ROLLBACK')
      throw error
    }
  }
}
```

### 5. 数据迁移

```javascript
{
  version: '1.1.2',
  name: 'migrate_old_species_data',
  description: '迁移旧的菌种数据格式',
  up: () => {
    // 更新旧格式的菌种名称
    const updates = [
      { old: 'E.coli', new: 'Escherichia coli' },
      { old: 'S.aureus', new: 'Staphylococcus aureus' },
      { old: 'Salmonella', new: 'Salmonella enterica' }
    ]
    
    const stmt = this.db.db.prepare(`
      UPDATE strains SET species = ? WHERE species = ?
    `)
    
    updates.forEach(({ old, new: newName }) => {
      stmt.run(newName, old)
    })
  }
}
```

## 迁移执行流程

### 1. 自动执行
系统启动时自动检查并执行待处理的迁移：

```javascript
// 在 DatabaseService.js 的 initialize() 方法中
this.migrationService = new MigrationService(this)
await this.migrationService.runMigrations()
```

### 2. 手动执行
通过系统设置界面手动触发迁移检查：

```javascript
// 前端调用
await window.electronAPI.database.runMigrations()
```

### 3. 执行顺序
- 按版本号升序执行
- 只执行比当前数据库版本更新的迁移
- 每个迁移在独立事务中执行

## 迁移最佳实践

### 1. 版本管理
```javascript
// ✅ 正确：递增版本号
'1.0.1' -> '1.0.2' -> '1.0.3'

// ❌ 错误：版本号倒退
'1.0.3' -> '1.0.1'
```

### 2. 向后兼容
```javascript
// ✅ 正确：添加默认值
ALTER TABLE users ADD COLUMN phone TEXT DEFAULT ''

// ❌ 错误：不提供默认值可能导致现有数据问题
ALTER TABLE users ADD COLUMN phone TEXT NOT NULL
```

### 3. 错误处理
```javascript
up: () => {
  try {
    // 迁移逻辑
    this.db.db.run('ALTER TABLE...')
  } catch (error) {
    // 处理特定错误
    if (error.message.includes('duplicate column')) {
      console.log('字段已存在，跳过')
      return
    }
    // 重新抛出未知错误
    throw error
  }
}
```

### 4. 事务使用
```javascript
up: () => {
  this.db.db.run('BEGIN TRANSACTION')
  try {
    // 多个相关操作
    this.db.db.run('CREATE TABLE...')
    this.db.db.run('INSERT INTO...')
    this.db.db.run('CREATE INDEX...')
    
    this.db.db.run('COMMIT')
  } catch (error) {
    this.db.db.run('ROLLBACK')
    throw error
  }
}
```

## 迁移测试

### 1. 开发环境测试
```bash
# 删除现有数据库
rm ~/.config/pams/pams.db

# 启动应用，观察迁移执行
npm run dev
```

### 2. 迁移验证
```javascript
// 在迁移后验证结果
const checkMigration = () => {
  const stmt = this.db.db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='new_table'
  `)
  const result = stmt.get()
  if (!result) {
    throw new Error('迁移失败：新表未创建')
  }
}
```

## 故障排除

### 1. 迁移失败
- 检查迁移代码语法
- 查看错误日志
- 手动回滚到上一个版本

### 2. 数据丢失预防
- 迁移前自动备份数据库
- 使用事务确保原子性
- 测试环境充分验证

### 3. 版本冲突
- 确保版本号唯一性
- 团队协作时协调版本分配
- 使用分支管理不同功能的迁移

## 监控和维护

### 1. 迁移历史查看
```javascript
// 获取迁移历史
const history = migrationService.getMigrationHistory()
console.log('已执行的迁移:', history)
```

### 2. 数据库健康检查
```javascript
// 执行健康检查
const health = await migrationService.healthCheck()
console.log('数据库状态:', health)
```

### 3. 性能监控
- 定期检查数据库大小
- 监控查询性能
- 优化索引使用

## 示例：完整迁移流程

假设需要为菌株表添加新的"培养条件"字段：

### 1. 创建迁移
```javascript
{
  version: '1.0.8',
  name: 'add_strain_culture_conditions',
  description: '为菌株表添加培养条件字段',
  up: () => {
    try {
      this.db.db.run(`
        ALTER TABLE strains 
        ADD COLUMN culture_conditions TEXT DEFAULT 'standard'
      `)
      
      // 为现有数据设置默认值
      this.db.db.run(`
        UPDATE strains 
        SET culture_conditions = 'standard' 
        WHERE culture_conditions IS NULL
      `)
      
      console.log('培养条件字段添加成功')
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        throw error
      }
    }
  }
}
```

### 2. 更新前端表单
```vue
<!-- 在菌株管理表单中添加新字段 -->
<el-form-item label="培养条件" prop="culture_conditions">
  <el-select v-model="form.culture_conditions">
    <el-option label="标准条件" value="standard" />
    <el-option label="厌氧条件" value="anaerobic" />
    <el-option label="微氧条件" value="microaerobic" />
  </el-select>
</el-form-item>
```

### 3. 测试迁移
1. 备份现有数据库
2. 启动应用验证迁移执行
3. 检查新字段是否正确添加
4. 测试前端表单功能

通过遵循这个迁移指南，可以安全、可靠地管理PAMS系统的数据库结构变更。
