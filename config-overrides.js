const {
  override,
  addWebpackAlias,
  addWebpackPlugin
} = require('customize-cra')
const path = require('path')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = override(
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src/')
  }),
  addWebpackPlugin(new NodePolyfillPlugin())
)
