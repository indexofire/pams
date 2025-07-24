# 动态排序功能实现

## 功能概述

为菌株管理、基因组管理、系统管理中的所有数据表格添加了动态排序功能，用户可以根据各个字段进行升序或降序排序。默认排序方式采用ID数字顺序排序。

## 实现的功能

### 1. 菌株管理 (Strains.vue)

**支持排序的字段：**
- ID - 数字排序
- 序号 - 数字排序
- 菌株编号 - 字符串排序
- 菌种（属）- 字符串排序
- 样本编号 - 字符串排序
- 样本来源 - 字符串排序
- 地区 - 字符串排序
- 来源 - 字符串排序
- 发病日期 - 日期排序
- 采样日期 - 日期排序
- 分离日期 - 日期排序
- 上送日期 - 日期排序
- 患者姓名 - 字符串排序
- 性别 - 字符串排序
- 年龄 - 数字排序
- 上传用户 - 字符串排序
- 创建时间 - 日期排序
- 更新时间 - 日期排序

**默认排序：** ID升序

### 2. 基因组管理 (Genomes.vue)

**支持排序的字段：**
- ID - 数字排序
- 序号 - 数字排序
- 菌株名称 - 字符串排序
- 数据文件 - 字符串排序
- MD5校验值 - 字符串排序
- 测序平台 - 字符串排序
- 组装软件 - 字符串排序
- 质量 - 自定义排序（excellent > good > fair > poor > unknown）
- 上传日期 - 日期排序

**默认排序：** ID升序

### 3. 用户管理 (UserManagement.vue)

**支持排序的字段：**
- ID - 数字排序
- 用户名 - 字符串排序
- 角色 - 字符串排序
- 创建时间 - 日期排序
- 最后登录 - 日期排序
- 状态 - 字符串排序

**默认排序：** ID升序

## 技术实现

### 1. 表格配置

为每个表格列添加 `sortable="custom"` 属性：

```vue
<el-table
  :data="sortedData"
  @sort-change="handleSortChange"
  :default-sort="{ prop: 'id', order: 'ascending' }"
>
  <el-table-column prop="id" label="ID" sortable="custom" />
  <el-table-column prop="name" label="名称" sortable="custom" />
  <!-- 其他列... -->
</el-table>
```

### 2. 排序状态管理

使用响应式对象管理排序配置：

```javascript
const sortConfig = reactive({
  prop: 'id',
  order: 'ascending'
})
```

### 3. 排序计算属性

创建排序后的数据计算属性：

```javascript
const sortedData = computed(() => {
  const data = [...originalData.value]
  
  if (!sortConfig.prop) {
    return data
  }

  return data.sort((a, b) => {
    let aVal = a[sortConfig.prop]
    let bVal = b[sortConfig.prop]

    // 处理空值
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return sortConfig.order === 'ascending' ? 1 : -1
    if (bVal == null) return sortConfig.order === 'ascending' ? -1 : 1

    // 数字类型排序
    if (sortConfig.prop === 'id' || sortConfig.prop === 'age') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
      return sortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
    }

    // 日期类型排序
    if (sortConfig.prop.includes('_date') || sortConfig.prop.includes('_at')) {
      aVal = new Date(aVal).getTime() || 0
      bVal = new Date(bVal).getTime() || 0
      return sortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
    }

    // 字符串类型排序
    aVal = String(aVal).toLowerCase()
    bVal = String(bVal).toLowerCase()
    
    if (aVal < bVal) return sortConfig.order === 'ascending' ? -1 : 1
    if (aVal > bVal) return sortConfig.order === 'ascending' ? 1 : -1
    return 0
  })
})
```

### 4. 排序事件处理

处理表格排序变化事件：

```javascript
const handleSortChange = ({ prop, order }) => {
  sortConfig.prop = prop
  sortConfig.order = order
}
```

## 排序类型

### 1. 数字排序
- 适用于：ID、序号、年龄等数字字段
- 处理：转换为数字后进行数值比较
- 空值处理：空值排在最后

### 2. 字符串排序
- 适用于：名称、编号、地区等文本字段
- 处理：转换为小写后进行字符串比较
- 空值处理：空值排在最后

### 3. 日期排序
- 适用于：创建时间、更新时间、各种日期字段
- 处理：转换为时间戳后进行数值比较
- 空值处理：空值排在最后

### 4. 自定义排序
- 适用于：质量等级等有特定顺序的枚举值
- 处理：定义优先级映射表进行排序
- 示例：excellent(4) > good(3) > fair(2) > poor(1) > unknown(0)

## 用户体验

### 1. 视觉反馈
- 可排序的列标题显示排序图标
- 当前排序列显示排序方向（升序/降序）
- 鼠标悬停时显示可点击状态

### 2. 交互方式
- 点击列标题进行排序
- 首次点击：升序
- 再次点击：降序
- 第三次点击：取消排序（恢复默认）

### 3. 默认行为
- 页面加载时默认按ID升序排序
- 保持用户的排序选择直到页面刷新
- 排序与筛选、分页功能兼容

## 性能优化

### 1. 计算属性缓存
- 使用Vue的computed属性自动缓存排序结果
- 只有在数据或排序配置变化时才重新计算

### 2. 内存优化
- 使用浅拷贝避免修改原始数据
- 排序操作在前端进行，减少服务器负载

### 3. 大数据处理
- 对于大量数据，排序在分页前进行
- 保持良好的响应性能

## 兼容性

### 1. 浏览器兼容
- 支持所有现代浏览器
- 使用标准JavaScript排序算法

### 2. 数据兼容
- 正确处理各种数据类型
- 优雅处理空值和异常数据

### 3. 功能兼容
- 与现有的筛选功能完全兼容
- 与分页功能无缝集成
- 不影响其他表格功能

## 测试建议

### 1. 功能测试
- 测试各种数据类型的排序
- 验证升序/降序切换
- 检查空值处理

### 2. 性能测试
- 测试大量数据的排序性能
- 验证内存使用情况
- 检查响应时间

### 3. 用户体验测试
- 验证排序图标显示
- 测试交互流畅性
- 检查与其他功能的兼容性

## 后续优化

### 1. 服务端排序
- 对于超大数据集，可考虑实现服务端排序
- 减少前端内存占用
- 提高大数据处理性能

### 2. 排序记忆
- 保存用户的排序偏好到本地存储
- 页面刷新后恢复上次的排序状态

### 3. 多列排序
- 支持按多个字段进行复合排序
- 提供更灵活的数据查看方式

这个动态排序功能大大提升了数据管理的用户体验，让用户能够快速找到需要的信息，提高工作效率。
