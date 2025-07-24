# 实验设置动态排序功能实现

## 功能概述

为实验设置页面的所有标签页添加了动态排序功能，用户可以根据各个字段进行升序或降序排序。默认排序方式采用ID数字顺序排序。

## 实现的标签页

### 1. 菌种管理 (Species Management)

**支持排序的字段：**
- ID - 数字排序
- 菌种名称 - 字符串排序
- 学名 - 字符串排序
- 缩写 - 字符串排序
- NCBI物种ID - 数字排序
- 描述 - 字符串排序
- 状态 - 字符串排序

**默认排序：** ID升序

### 2. 地区管理 (Region Management)

**支持排序的字段：**
- ID - 数字排序
- 地区名称 - 字符串排序
- 地区代码 - 字符串排序
- 级别 - 自定义排序（省/直辖市 > 市 > 区/县）
- 状态 - 字符串排序

**默认排序：** ID升序

### 3. 样本类型管理 (Sample Source Management)

**支持排序的字段：**
- ID - 数字排序
- 来源名称 - 字符串排序
- 类别 - 自定义排序（临床 > 环境 > 其他）
- 描述 - 字符串排序
- 状态 - 字符串排序

**默认排序：** ID升序

### 4. 来源管理 (Project Management)

**支持排序的字段：**
- ID - 数字排序
- 项目名称 - 字符串排序
- 描述 - 字符串排序
- 状态 - 字符串排序

**默认排序：** ID升序

### 5. 实验类型管理 (Experiment Type Management)

**支持排序的字段：**
- ID - 数字排序
- 实验名称 - 字符串排序
- 实验描述 - 字符串排序
- 状态 - 字符串排序

**默认排序：** ID升序

## 技术实现

### 1. 表格配置更新

为每个标签页的表格添加排序支持：

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

为每个标签页创建独立的排序配置：

```javascript
// 菌种排序配置
const speciesSortConfig = reactive({
  prop: 'id',
  order: 'ascending'
})

// 地区排序配置
const regionsSortConfig = reactive({
  prop: 'id',
  order: 'ascending'
})

// 其他标签页的排序配置...
```

### 3. 排序计算属性

为每个标签页创建排序后的数据计算属性：

```javascript
// 菌种排序计算属性
const sortedSpecies = computed(() => {
  const data = [...speciesOptions.value]
  
  if (!speciesSortConfig.prop) {
    return data
  }

  return data.sort((a, b) => {
    let aVal = a[speciesSortConfig.prop]
    let bVal = b[speciesSortConfig.prop]

    // 处理空值
    if (aVal == null && bVal == null) return 0
    if (aVal == null) return speciesSortConfig.order === 'ascending' ? 1 : -1
    if (bVal == null) return speciesSortConfig.order === 'ascending' ? -1 : 1

    // 数字类型排序
    if (speciesSortConfig.prop === 'id' || speciesSortConfig.prop === 'ncbi_txid') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
      return speciesSortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
    }

    // 字符串类型排序
    aVal = String(aVal).toLowerCase()
    bVal = String(bVal).toLowerCase()
    
    if (aVal < bVal) return speciesSortConfig.order === 'ascending' ? -1 : 1
    if (aVal > bVal) return speciesSortConfig.order === 'ascending' ? 1 : -1
    return 0
  })
})
```

### 4. 排序事件处理

为每个标签页创建排序处理方法：

```javascript
// 菌种排序处理
const handleSpeciesSortChange = ({ prop, order }) => {
  speciesSortConfig.prop = prop
  speciesSortConfig.order = order
}

// 地区排序处理
const handleRegionsSortChange = ({ prop, order }) => {
  regionsSortConfig.prop = prop
  regionsSortConfig.order = order
}

// 其他标签页的排序处理...
```

### 5. 分页集成

修改分页计算属性以使用排序后的数据：

```javascript
// 菌种分页数据
const paginatedSpecies = computed(() => {
  const start = (speciesPagination.current - 1) * speciesPagination.size
  const end = start + speciesPagination.size
  return sortedSpecies.value.slice(start, end)
})
```

## 特殊排序处理

### 1. 地区级别排序

地区级别按照行政层级进行排序：

```javascript
if (regionsSortConfig.prop === 'level') {
  const levelOrder = { province: 3, city: 2, district: 1 }
  aVal = levelOrder[aVal] || 0
  bVal = levelOrder[bVal] || 0
  return regionsSortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
}
```

### 2. 样本类别排序

样本类别按照重要性进行排序：

```javascript
if (sourcesSortConfig.prop === 'category') {
  const categoryOrder = { clinical: 3, environmental: 2, other: 1 }
  aVal = categoryOrder[aVal] || 0
  bVal = categoryOrder[bVal] || 0
  return sourcesSortConfig.order === 'ascending' ? aVal - bVal : bVal - aVal
}
```

## 排序类型支持

### 1. 数字排序
- **适用字段**：ID、NCBI物种ID
- **处理方式**：转换为数字后进行数值比较
- **空值处理**：空值排在最后

### 2. 字符串排序
- **适用字段**：名称、描述、代码等文本字段
- **处理方式**：转换为小写后进行字符串比较
- **空值处理**：空值排在最后

### 3. 自定义排序
- **适用字段**：级别、类别、状态等枚举值
- **处理方式**：定义优先级映射表进行排序
- **示例**：province(3) > city(2) > district(1)

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
- 所有标签页默认按ID升序排序
- 保持用户的排序选择直到页面刷新
- 排序与分页功能完全兼容

## 性能优化

### 1. 计算属性缓存
- 使用Vue的computed属性自动缓存排序结果
- 只有在数据或排序配置变化时才重新计算

### 2. 独立排序状态
- 每个标签页维护独立的排序状态
- 切换标签页时保持各自的排序设置

### 3. 内存优化
- 使用浅拷贝避免修改原始数据
- 排序操作在前端进行，减少服务器负载

## 兼容性

### 1. 功能兼容
- 与现有的分页功能完全兼容
- 与筛选、搜索功能无缝集成
- 不影响其他表格功能

### 2. 数据兼容
- 正确处理各种数据类型
- 优雅处理空值和异常数据

### 3. 操作兼容
- 与现有的增删改查操作完全兼容
- 排序状态在数据更新后自动刷新

## 测试建议

### 1. 功能测试
- 测试各种数据类型的排序
- 验证升序/降序切换
- 检查空值处理
- 测试特殊排序（级别、类别）

### 2. 交互测试
- 验证排序图标显示
- 测试点击响应
- 检查与分页的配合

### 3. 数据测试
- 测试大量数据的排序性能
- 验证数据更新后的排序状态
- 检查导入导出功能的兼容性

## 后续优化

### 1. 排序记忆
- 保存用户的排序偏好到本地存储
- 页面刷新后恢复上次的排序状态

### 2. 多列排序
- 支持按多个字段进行复合排序
- 提供更灵活的数据查看方式

### 3. 排序指示器
- 在列标题显示更明显的排序状态
- 提供排序优先级指示

这个动态排序功能大大提升了实验设置页面的用户体验，让用户能够快速找到需要的配置项，提高工作效率。
