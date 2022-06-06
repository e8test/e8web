const {
  override,
  addWebpackAlias,
  fixBabelImports,
  addWebpackPlugin
} = require('customize-cra')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const path = require('path')

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src/')
  }),
  fixBabelImports('babel-plugin-import', {
    libraryName: '@arco-design/web-react/icon',
    libraryDirectory: 'react-icon',
    camel2DashComponentName: false
  }),
  addWebpackPlugin(new NodePolyfillPlugin())
)
