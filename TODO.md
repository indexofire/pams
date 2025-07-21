# To do list

## 设计思路

## 功能添加

## 错误修复

1. ✅ **已修复** - 客户端角色权限管理没有增加和修改的功能按键，使用admin登录后无法增加角色。权限角色需要和用户管理中的角色对应。
   - 添加了创建角色对话框和功能
   - 添加了编辑角色对话框和功能
   - 添加了编辑角色权限对话框和功能
   - 修复了API调用，使用正确的后端接口

2. ✅ **已修复** - 错误信息：Error occurred in handler for 'users:getAllRoles': Error: No handler registered for 'users:getAllRoles'。用户角色开发存在问题，需要进行修改。
   - 修复了前端API调用，使用正确的`window.electronAPI.users.getAllRoles()`
   - 修复了权限加载，使用正确的`window.electronAPI.users.getAllPermissions()`
   - 添加了数据格式转换逻辑

3. ✅ **已修复** - 主界面选择切换语言时，界面没有获得相应的语言变化。有很多称呼都有问题，比如'nav.dashboard'应直接是dashboard等。
   - 修复了语言切换组件，添加了响应式更新
   - 更新了中文和英文语言文件，添加了缺失的翻译key
   - 修复了App.vue中的语言key使用
   - 添加了退出登录等消息的国际化支持

## 其他
