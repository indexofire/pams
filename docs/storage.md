# Storage

## 前端数据存储位置

1. 浏览器环境（开发测试）

当在浏览器中运行前端项目时，数据存储在以下位置：

### localStorage存储

- 存储位置：浏览器的localStorage
- 存储键名：
```
'pams_species_options'     // 菌种数据
'pams_region_options'      // 地区数据  
'pams_source_options'      // 样本来源数据
'pams_experiment_types'    // 实验类型数据
```
- 物理位置（以Chrome为例）：
  * Linux: ~/.config/google-chrome/Default/Local Storage/leveldb/
  * Windows: %LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\leveldb\
  * macOS: ~/Library/Application Support/Google/Chrome/Default/Local Storage/leveldb/

### Vuex Store（内存）

- 存储位置：浏览器内存中
- 数据类型：响应式状态管理
- 生命周期：页面刷新后重置，需要从localStorage恢复

## 2. 客户端环境（Electron应用）

当作为Electron客户端运行时：

### 本地文件存储

- 存储位置：Electron应用的userData目录
- 路径示例：
  * Linux: ~/.config/pams/
  * Windows: %APPDATA%\pams\
  * macOS: ~/Library/Application Support/pams/

数据库文件

- SQLite数据库：pams.db
- 配置文件：config.json
- 日志文件：logs/目录
- 数据存储架构

### 数据存储架构

当前的数据存储实现：双重存储策略

#### 1. 开发环境（浏览器）

```
// 数据保存到localStorage
localStorage.setItem('pams_species_options', JSON.stringify(speciesOptions.value))
localStorage.setItem('pams_region_options', JSON.stringify(regionOptions.value))
localStorage.setItem('pams_source_options', JSON.stringify(sourceOptions.value))
localStorage.setItem('pams_experiment_types', JSON.stringify(experimentTypes.value))
```

#### 2. 生产环境（Electron客户端）

```
// 通过Electron API保存到本地文件
if (window.electronAPI && window.electronAPI.systemConfig) {
  const species = await window.electronAPI.systemConfig.getSpecies()
  const regions = await window.electronAPI.systemConfig.getRegions()
  // ...
}
```

### 具体存储位置

浏览器开发环境

- Chrome DevTools查看：
  1. 打开开发者工具 (F12)
  2. 进入 Application 标签
  3. 左侧选择 Local Storage
  4. 选择 http://localhost:8080
  5. 可以看到所有 pams_* 键值对
-数据格式：JSON字符串
```
{
  "pams_species_options": "[{\"id\":1,\"name\":\"大肠杆菌\",\"scientific_name\":\"Escherichia coli\",...}]",
  "pams_region_options": "[{\"id\":1,\"name\":\"北京市\",\"code\":\"110000\",...}]"
}
```

Electron客户端环境

- 配置目录：
```
~/.config/pams/                     # Linux
%APPDATA%\pams\                     # Windows  
~/Library/Application Support/pams/ # macOS
```
- 文件结构：
```
pams/
├── pams.db              # SQLite数据库
├── config.json          # 应用配置
├── logs/                # 日志文件
│   ├── main.log
│   └── renderer.log
└── userData/            # 用户数据
    ├── species.json
    ├── regions.json
    ├── sources.json
    └── experiments.json
```

### 数据同步机制

菌株管理关联

菌株管理界面的下拉选项需要与实验设置关联,菌株管理页面通过Vuex store获取实验设置的数据：

```
// 菌株管理页面从store获取选项数据
const speciesOptions = computed(() => store.getters.activeSpeciesOptions)
const regionOptions = computed(() => store.getters.activeRegionOptions)
const sourceOptions = computed(() => store.getters.activeSourceOptions)
const experimentTypeOptions = computed(() => store.getters.activeExperimentTypeOptions)
```

### 数据流向图

```
实验设置页面 → localStorage/Electron API → Vuex Store → 菌株管理页面
     ↓                    ↓                    ↓              ↓
   用户编辑            持久化存储           内存状态        下拉选项
```

### 开发测试时的数据管理

#### 清除测试数据

```
// 在浏览器控制台执行
localStorage.removeItem('pams_species_options')
localStorage.removeItem('pams_region_options')
localStorage.removeItem('pams_source_options')
localStorage.removeItem('pams_experiment_types')

// 或者清除所有PAMS相关数据
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('pams_')) {
    localStorage.removeItem(key)
  }
})
```

#### 查看存储数据

```
// 查看菌种数据
console.log(JSON.parse(localStorage.getItem('pams_species_options')))

// 查看所有实验设置数据
['pams_species_options', 'pams_region_options', 'pams_source_options', 'pams_experiment_types']
  .forEach(key => {
    console.log(key, JSON.parse(localStorage.getItem(key)))
  })
```

## 总结

- 前端测试：数据存储在浏览器的localStorage中
- 客户端：数据存储在Electron应用的userData目录中
- 关联机制：实验设置的数据通过Vuex store同步到菌株管理的下拉选项
- 持久化：所有数据变更都会自动保存，页面刷新后数据保持

这种双重存储策略确保了开发和生产环境的数据一致性，同时实现了实验设置与菌株管理之间的数据关联。