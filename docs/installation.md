# PAMS 安装指南

## 系统要求

- Python 3.8+
- PostgreSQL 12+ (推荐) 或 SQLite
- 8GB+ RAM (推荐16GB用于大规模分析)
- 100GB+ 磁盘空间

## 环境准备

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/pams.git
cd pams
```

### 2. 创建虚拟环境

```bash
# 使用conda (推荐)
conda create -n pams python=3.8
conda activate pams

# 或使用venv
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate  # Windows
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

## 数据库配置

### PostgreSQL (生产环境推荐)

1. 安装PostgreSQL
2. 创建数据库和用户：

```sql
CREATE DATABASE pams;
CREATE USER pams_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE pams TO pams_user;
```

3. 配置环境变量：

```bash
export DATABASE_URL="postgresql://pams_user:your_password@localhost/pams"
```

### SQLite (开发环境)

SQLite无需额外配置，数据库文件将自动创建。

## 配置文件

复制并编辑配置文件：

```bash
cp config/config.example.yaml config/config.yaml
```

根据您的环境修改配置参数。

## 初始化数据库

```bash
python setup.py init_db
```

## 启动服务

```bash
python app.py
```

访问 http://localhost:5000 开始使用PAMS。

## Docker部署 (可选)

```bash
docker build -t pams .
docker run -p 5000:5000 pams
```

## 故障排除

常见问题和解决方案请参考 [FAQ](faq.md)。 