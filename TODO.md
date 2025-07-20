# To do list

## 功能添加

1. 系统设置中菌种管理功能实现，可以定义菌种名称，以及其拉丁文对应名称。定义的菌种名称会与菌株管理的“菌种（属）”字段的下拉菜单中对应，而不是使用现在默认的几个选项。
2. 系统设置中地区管理功能实现，可以定义地区名称，定义的地区名称会与菌株管理的“地区”字段的下拉菜单中对应，而不是使用现在默认的几个选项。


## 错误修复

1. 基因组序列选中后，继续上传按钮无法点击。
2. 系统设置中，当点击"菌种管理"，"地区管理"，"样本来源","实验管理“时，出现”Uncaught runtime errors:“错误。比如点击菌种管理，跳出页面显示：
```
“ERROR
ResizeObserver loop completed with undelivered notifications.
    at handleError (webpack-internal:///./node_modules/webpack-dev-server/client/overlay.js:251:58)
    at eval (webpack-internal:///./node_modules/webpack-dev-server/client/overlay.js:270:7)”
```
3. npm run dev 启动electron应用程序后，使用admin/admin123登录，提示错误“Error invoking remote method 'auth:login': Error: 用户数据异常，请联系管理员”，用户无法登录。
查看命令行错误，提示：
```
"Uncaught (in promise) TypeError: Failed to fetch", source: devtools://devtools/bundled/panels/elements/elements.js (1)
[1] 用户密码字段为空: []
[1] 用户登录失败: Error: 用户数据异常，请联系管理员
[1]     at UserService.login (/home/mark/repos/github/pams/src/services/UserService.js:196:15)
[1]     at /home/mark/repos/github/pams/electron/main.js:239:30
[1]     at WebContents.<anonymous> (node:electron/js2c/browser_init:2:89153)
[1]     at WebContents.emit (node:events:513:28)
[1] Error occurred in handler for 'auth:login': Error: 用户数据异常，请联系管理员
[1]     at UserService.login (/home/mark/repos/github/pams/src/services/UserService.js:196:15)
[1]     at /home/mark/repos/github/pams/electron/main.js:239:30
[1]     at WebContents.<anonymous> (node:electron/js2c/browser_init:2:89153)
[1]     at WebContents.emit (node:events:513:28)
```

## 其他

1. sass-loader包版本较老，不符合Dart Sass 2.0的规范，因此开发依赖包更新为sass-embedded和sass-loader符合规范的版本。并更新frontend/src/App.vue中代码。