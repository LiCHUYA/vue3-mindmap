const path = require('path')

module.exports = {
  publicPath: './',
  outputDir: './dist', // 打包dist所在路径
  lintOnSave: false,
  productionSourceMap: false,
  transpileDependencies: ['simple-mind-map'],
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/')
      }
    }
  }
}
