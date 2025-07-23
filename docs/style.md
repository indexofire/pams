# Style

## icon

第三方图标库集成。项目集成了第三方图标库，让界面更加丰富多样！

### 集成图标库：

1. IconPark图标库 (@icon-park/vue-next)

字节跳动开源的高质量图标库，支持多种主题：outline、filled、two-tone等，丰富的图标选择，适合现代化界面。

2. Font Awesome图标库 (@fortawesome/fontawesome-svg-core)

世界上最受欢迎的图标库，包含医疗、科学、用户界面等各类图标，矢量图标，支持任意缩放

### 技术实现

图标配置文件 ( frontend/src/plugins/icons.js)
- 统一管理所有第三方图标
- 分类配置：样本信息、日期、操作按钮、生物学相关
- 提供图标渲染辅助函数

主应用注册 ( frontend/src/main.js)
- 全局注册Font Awesome组件
- 与Element Plus图标共存

界面更新效果

工具栏按钮
- 添加菌株：Font Awesome plus 图标 ➕
- 导入菌株：Font Awesome upload 图标 ⬆️
- 导出菌株：Font Awesome download 图标 ⬇️
- 批量删除：Font Awesome trash 图标 🗑️
- 搜索框：Font Awesome search 图标 🔍

样本信息列图标
- 姓名：Font Awesome user 图标 👤 (蓝色)
- 性别：动态图标
- 男性：Font Awesome mars 图标 ♂️ (蓝色)
- 女性：Font Awesome venus 图标 ♀️ (红色)
- 未知：Font Awesome genderless 图标 ⚲ (灰色)
- 年龄：Font Awesome baby 图标 👶 (橙色)
- 身份证号：Font Awesome id-card 图标 🆔 (绿色)

日期信息列图标
- 发病日期：Font Awesome pills 图标 💊 (红色)
- 采样日期：Font Awesome vial 图标 🧪 (蓝色)
- 分离日期：Font Awesome microscope 图标 🔬 (橙色)
- 上送日期：Font Awesome hospital 图标 🏥 (绿色)

### 视觉效果提升

图标特性
- 语义化：每个图标都有明确的含义
- 色彩区分：不同类型信息用不同颜色
- 悬浮效果：鼠标悬停时图标放大1.2倍
- 状态显示：空值时图标变为20%透明度并灰度化
- 工具提示：悬浮显示详细信息

响应式设计
- 图标大小：18px（表格中）、16px（按钮中）
- 间距合理：6px图标间距
- 颜色协调：与Element Plus主题色保持一致

### 依赖管理

- IconPark: @icon-park/vue-next
- Font Awesome:
  * @fortawesome/fontawesome-svg-core
  * @fortawesome/free-solid-svg-icons
  * @fortawesome/vue-fontawesome

### 可扩展性

- 图标配置文件支持轻松添加新图标
- 支持多种图标库混合使用
- 提供统一的图标渲染接口
- 便于后续添加更多图标库（如Material Design Icons等）

现在菌株管理界面的图标更加丰富多样，用户体验大大提升！界面既保持了专业性，又增加了现代化的视觉效果。所有图标都经过精心选择，符合医疗和科研领域的使用习惯。

