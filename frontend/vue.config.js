const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/',
  devServer: {
    host: 'localhost',
    port: 8080,
    open: false,
    allowedHosts: 'all',
    client: {
      webSocketURL: 'ws://localhost:8080/ws'
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': require('path').resolve(__dirname, 'src')
      }
    }
  },
  chainWebpack: config => {
    // 为electron环境设置环境变量
    config.plugin('define').tap(definitions => {
      definitions[0]['process.env'].IS_ELECTRON = JSON.stringify(!!process.env.IS_ELECTRON)
      return definitions
    })
  }
})
