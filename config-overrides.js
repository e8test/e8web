const {
  override,
  addWebpackAlias,
  fixBabelImports,
  addWebpackPlugin
} = require('customize-cra')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
const path = require('path')
const webpack = require('webpack')
const dayjs = require('dayjs')
const pkg = require('./package.json')

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src/')
  }),
  fixBabelImports('babel-plugin-import', {
    libraryName: '@arco-design/web-react/icon',
    libraryDirectory: 'react-icon',
    camel2DashComponentName: false
  }),
  addWebpackPlugin(
    new NodePolyfillPlugin({
      excludeAliases: ['console']
    })
  ),
  addWebpackPlugin(
    new webpack.DefinePlugin({
      __VERSION__: `"${pkg.version} build-${dayjs().format('YYMMDD')}"`
    })
  )
)
