# PAMS - 实验室细菌基因组管理工具

PAMS (Pathogen Analysis Management System) 是一个CDC本地化的实验室细菌基因组管理工具，专为基层CDC微生物实验室设计，用于管理和分析细菌基因组数据。

## 项目简介

日常工作中，实验室分离得到的细菌克隆在完成基因组测序后获得了组装子序列，这些数据往往不能上传到如NCBI数据库中公开。对于实验室开展的越来越多的测序数据，需要进行系统化管理。PAMS将生物信息学分析流程得到的菌株特征结果（如ST型别、毒力基因、耐药基因等）与流行病学相关背景资料进行关联和管理，为实验室提供全面的细菌基因组数据管理解决方案。

通过对菌株基因组序列的溯源分析，可以帮助实验人员快速发现基因组的遗传关系，潜在的暴发事件。并能很方便的帮助实验人员根据数据特征，筛选特定的基因组序列。

软件使用electron实现跨平台支持，前端开发框架使用vue.js。软件支持多用户管理，并对用户权限进行管理和设置。

## 核心功能

### 📊 数据管理
- **基因组序列储存**: 安全存储和管理细菌基因组组装子数据
- **菌株流行病学信息**: 记录和管理菌株的来源、时间、地点等流行病学背景
- **序列特征信息**: 存储ST型别、毒力基因、耐药基因等分析结果

### 🔬 生物信息学分析
- **基因组注释**: 自动化基因组功能注释
- **型别分析**: ST型别、血清型等分型分析
- **毒力/耐药基因检测**: 识别和分类毒力因子和抗生素耐药基因
- **质量控制**: 基因组组装质量评估

### 🧬 高级分析功能
- **系统发育分析**: 构建菌株间的进化关系树
- **基因组比较**: 多基因组比对和差异分析
- **遗传关系研判**: 快速发现菌株的遗传关系和可能的共同来源
- **聚类分析**: 基于基因组相似性的菌株聚类

### 📈 可视化与报告
- **交互式图表**: 动态展示分析结果
- **流行病学报告**: 生成标准化的流行病学调查报告
- **数据导出**: 支持多种格式的数据导出

## 技术特点

- 🏠 **本地化部署**: 确保敏感数据安全，无需依赖外部服务
- ⚡ **高性能计算**: 优化的算法确保大规模数据的快速处理
- 🔄 **自动化流程**: 减少人工干预，提高分析效率
- 📱 **用户友好界面**: 直观的用户界面，便于非生信专业人员使用

## 安装说明

```bash
git clone https://github.com/indexofire/pams.git
cd pams
```

详细安装指南请参考 [安装文档](docs/installation.md)

## 贡献指南

我们欢迎来自微生物学、生物信息学和软件开发社区的贡献！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系我们

- 问题报告: [GitHub Issues](https://github.com/indexofire/pams/issues)
- 功能建议: [GitHub Discussions](https://github.com/indexofire/pams/discussions)

## 致谢

感谢所有为细菌基因组学和公共卫生领域做出贡献的研究人员和开发者。 