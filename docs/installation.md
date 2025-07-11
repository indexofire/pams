# PAMS 安装指南

PAMS是一个基于Electron + Vue.js + Node.js的桌面应用程序，专为CDC实验室细菌基因组管理设计。

## 🖥️ 系统要求

### 最终用户（生产环境）
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **内存**: 4GB RAM (推荐8GB)
- **存储空间**: 1GB可用空间
- **其他**: 无需安装额外依赖，应用自包含

### 开发者（开发环境）
- **Node.js**: 16.x 或更高版本
- **npm**: 8.x 或更高版本
- **Git**: 最新版本
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+

## 📦 最终用户安装

### Windows
1. 下载最新版本的 `PAMS-Setup-x.x.x.exe`
2. 双击安装包，按照向导完成安装
3. 从开始菜单或桌面启动PAMS

### macOS
1. 下载最新版本的 `PAMS-x.x.x.dmg`
2. 双击DMG文件，将PAMS拖拽到Applications文件夹
3. 从启动台或Applications文件夹启动PAMS
4. 如遇安全提示，请在系统偏好设置 > 安全性与隐私中允许运行

### Linux
1. 下载最新版本的 `PAMS-x.x.x.AppImage`
2. 添加执行权限：`chmod +x PAMS-x.x.x.AppImage`
3. 双击或命令行运行：`./PAMS-x.x.x.AppImage`

## 🛠️ 开发者安装

### 1. 克隆仓库
```bash
git clone https://github.com/indexofire/pams.git
cd pams
```

### 2. 安装依赖

#### 安装主项目依赖
```bash
npm install
```

#### 安装前端依赖
```bash
cd frontend
npm install
cd ..
```

### 3. 验证安装
```bash
# 检查Node.js版本
node --version  # 应该显示 v16.x.x 或更高

# 检查npm版本
npm --version   # 应该显示 8.x.x 或更高
```

## 🚀 开发环境运行

### 启动开发服务器
```bash
# 启动前端开发服务器和Electron应用
npm run dev
```

这将会：
1. 启动Vue.js开发服务器 (http://localhost:8080)
2. 等待前端服务启动完成
3. 自动启动Electron应用

### 单独启动组件（用于调试）
```bash
# 仅启动前端开发服务器
npm run serve

# 仅启动Electron应用（需要前端服务已运行）
npm run electron
```

## 📦 构建和打包

### 开发构建
```bash
# 构建前端资源
npm run build
```

### 生产打包
```bash
# 构建并打包为安装程序
npm run dist
```

生成的安装包位于 `dist/` 目录：
- Windows: `PAMS Setup x.x.x.exe`
- macOS: `PAMS-x.x.x.dmg`
- Linux: `PAMS-x.x.x.AppImage`

### 平台特定打包
```bash
# 仅打包Windows版本
npm run electron-pack -- --win

# 仅打包macOS版本
npm run electron-pack -- --mac

# 仅打包Linux版本
npm run electron-pack -- --linux
```

## 🔧 生物信息学工具配置

PAMS依赖以下外部生物信息学工具进行基因组分析：

### 必需工具
- **Prokka**: 基因组注释
- **MLST**: 多位点序列分型
- **ABRicate**: 抗性和毒力基因检测
- **Snippy**: SNP检测

### 安装生信工具

#### 使用Conda（推荐）
```bash
# 创建专用环境
conda create -n pams-tools python=3.8

# 激活环境
conda activate pams-tools

# 安装工具
conda install -c bioconda prokka mlst abricate snippy
```

#### 配置工具路径
在PAMS应用中：
1. 打开 **设置** > **工具配置**
2. 设置各工具的可执行文件路径
3. 测试工具是否正常运行

默认搜索路径：
- `/usr/local/bin/`
- `/opt/conda/envs/pams-tools/bin/`
- `$PATH` 环境变量

## 📊 数据库配置

PAMS使用SQLite数据库，无需额外配置：

- **数据库文件**: 自动创建在用户数据目录
  - Windows: `%APPDATA%/pams/pams.db`
  - macOS: `~/Library/Application Support/pams/pams.db`
  - Linux: `~/.config/pams/pams.db`

### 数据备份
定期备份数据库文件即可保存所有数据：
```bash
# Linux/macOS
cp ~/.config/pams/pams.db /path/to/backup/

# Windows
copy "%APPDATA%\pams\pams.db" "C:\path\to\backup\"
```

## 🔍 故障排除

### 常见问题

#### 1. Electron应用无法启动
```bash
# 清除node_modules重新安装
rm -rf node_modules frontend/node_modules
npm install
cd frontend && npm install && cd ..
```

#### 2. 前端开发服务器启动失败
```bash
# 检查端口是否被占用
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# 使用不同端口
cd frontend
npm run serve -- --port 8081
```

#### 3. SQLite数据库错误
- 检查用户数据目录的写入权限
- 确保没有其他PAMS实例在运行
- 删除数据库文件重新创建（将丢失数据）

#### 4. 生信工具未找到
1. 确认工具已正确安装
2. 检查工具是否在PATH中：`which prokka`
3. 在PAMS设置中手动指定工具路径

#### 5. 打包失败
```bash
# 清理构建缓存
npm run clean  # 如果有这个脚本
rm -rf dist/

# 重新安装打包依赖
npm install electron-builder --save-dev
```

## 📝 日志和调试

### 开发模式
- Electron开发者工具会自动打开
- 控制台日志显示应用运行状态
- 数据库操作日志输出到终端

### 生产模式
- 日志文件位置：
  - Windows: `%APPDATA%/pams/logs/`
  - macOS: `~/Library/Logs/pams/`
  - Linux: `~/.config/pams/logs/`

### 启用详细日志
```bash
# 设置环境变量
export NODE_ENV=development
export DEBUG=pams:*
```

## 📚 更多资源

- [项目主页](https://github.com/indexofire/pams)
- [用户手册](https://github.com/indexofire/pams/wiki)
- [问题反馈](https://github.com/indexofire/pams/issues)
- [开发者文档](docs/development.md)

## 🔄 更新升级

### 检查更新
PAMS会自动检查新版本（需要网络连接）

### 手动更新
1. 下载最新版本安装包
2. 关闭当前PAMS应用
3. 安装新版本（会保留用户数据）
4. 重新启动应用

---

如遇到安装问题，请查看 [FAQ](docs/faq.md) 或提交 [Issue](https://github.com/indexofire/pams/issues)。 