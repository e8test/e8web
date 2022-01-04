const {
  override,
  addWebpackAlias,
  addWebpackPlugin,
  fixBabelImports
} = require('customize-cra')
const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src/')
  }),
  addWebpackPlugin(
    new NodePolyfillPlugin({
      excludeAliases: ['console', 'console-browserify']
    })
  ),
  fixBabelImports('babel-plugin-import', {
    libraryName: '@arco-design/web-react/icon',
    libraryDirectory: 'react-icon',
    camel2DashComponentName: false
  })
)
