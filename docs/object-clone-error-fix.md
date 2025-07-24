# 实验设置对象克隆错误修复

## 问题描述

在实验设置界面中，导入数据后对数据进行修改时，会出现以下错误：

```
保存项目失败: An object could not be cloned.
```

## 问题原因

这个错误是由于Electron的IPC（进程间通信）机制在序列化对象时遇到了不可克隆的属性导致的。具体原因包括：

1. **直接对象赋值**：编辑方法使用`Object.assign(form, object)`直接将整个对象赋值给表单
2. **不可序列化属性**：对象可能包含函数、循环引用、或其他不可序列化的属性
3. **IPC序列化限制**：Electron的IPC需要序列化对象进行进程间传递，遇到不可克隆属性时会失败

## 修复方案

### 1. 修复编辑方法

将所有编辑方法从直接对象赋值改为只复制需要的属性：

**修复前：**
```javascript
const editProject = (project) => {
  Object.assign(projectForm, project)  // 直接赋值整个对象
  projectDialogVisible.value = true
}
```

**修复后：**
```javascript
const editProject = (project) => {
  // 只复制需要的属性，避免不可克隆的属性
  Object.assign(projectForm, {
    id: project.id,
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'active'
  })
  projectDialogVisible.value = true
}
```

### 2. 修复保存方法

确保传递给API的数据是干净的，只包含需要的属性：

**修复前：**
```javascript
const result = await window.electronAPI.systemConfig.saveProject(projectForm)
```

**修复后：**
```javascript
// 创建一个干净的数据对象，只包含需要的属性
const cleanProjectData = {
  id: projectForm.id,
  name: projectForm.name.trim(),
  description: projectForm.description || '',
  status: projectForm.status || 'active'
}
const result = await window.electronAPI.systemConfig.saveProject(cleanProjectData)
```

### 3. 修复的方法列表

以下方法已被修复：

1. **项目管理**
   - `editProject()` - 编辑项目
   - `saveProject()` - 保存项目

2. **菌种管理**
   - `editSpecies()` - 编辑菌种
   - `saveSpecies()` - 保存菌种（更新和添加）

3. **地区管理**
   - `editRegion()` - 编辑地区
   - `saveRegion()` - 保存地区（更新和添加）

4. **样本来源管理**
   - `editSource()` - 编辑样本来源
   - `saveSource()` - 保存样本来源（更新和添加）

5. **实验类型管理**
   - `editExperiment()` - 编辑实验类型
   - 使用深拷贝处理复杂的实验数据结构

## 修复细节

### 属性过滤

每个编辑方法现在只复制必要的属性：

```javascript
// 菌种编辑
Object.assign(speciesForm, {
  id: species.id,
  name: species.name || '',
  scientific_name: species.scientific_name || '',
  abbreviation: species.abbreviation || '',
  ncbi_txid: species.ncbi_txid || '',
  description: species.description || '',
  status: species.status || 'active'
})

// 地区编辑
Object.assign(regionForm, {
  id: region.id,
  name: region.name || '',
  code: region.code || '',
  level: region.level || 'province',
  description: region.description || '',
  status: region.status || 'active'
})
```

### 数据清理

保存方法现在创建干净的数据对象：

```javascript
// 菌种保存
const cleanSpeciesData = {
  id: speciesForm.id,
  name: speciesForm.name?.trim() || '',
  scientific_name: speciesForm.scientific_name?.trim() || '',
  abbreviation: speciesForm.abbreviation?.trim() || '',
  ncbi_txid: speciesForm.ncbi_txid?.trim() || '',
  description: speciesForm.description?.trim() || '',
  status: speciesForm.status || 'active'
}
```

### 深拷贝处理

对于复杂的嵌套对象（如实验数据），使用深拷贝：

```javascript
experimentData: experiment.experimentData
  ? JSON.parse(JSON.stringify(experiment.experimentData)) // 深拷贝避免引用问题
  : [/* 默认数据 */]
```

## 测试验证

### 测试步骤

1. **导入数据**：使用JSON文件导入各种类型的数据
2. **编辑数据**：点击编辑按钮修改导入的数据
3. **保存数据**：确认修改并保存
4. **验证结果**：检查是否出现克隆错误

### 预期结果

- ✅ 不再出现"An object could not be cloned"错误
- ✅ 数据可以正常编辑和保存
- ✅ 保存后数据正确更新到数据库
- ✅ 页面刷新后数据保持不变

## 技术要点

### IPC序列化限制

Electron的IPC机制使用结构化克隆算法，不支持：
- 函数
- 循环引用
- DOM节点
- 某些内置对象

### 最佳实践

1. **属性白名单**：只传递需要的属性
2. **数据清理**：去除空值和不必要的属性
3. **类型转换**：确保数据类型正确
4. **深拷贝**：对复杂对象使用深拷贝避免引用问题

## 相关文件

- `frontend/src/views/ExperimentSettings.vue` - 主要修复文件
- `src/services/SystemConfigService.js` - 后端数据库操作
- `electron/main.js` - IPC处理器
- `electron/preload.js` - API暴露

## 注意事项

1. **数据完整性**：确保所有必要的属性都被正确复制
2. **默认值处理**：为可选属性提供合理的默认值
3. **错误处理**：添加适当的错误处理和用户提示
4. **性能考虑**：避免不必要的深拷贝操作

这个修复确保了实验设置界面在Electron环境下的稳定性和可靠性。
