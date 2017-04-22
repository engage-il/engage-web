var webpack = require('webpack')
var path = require('path')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var CleanWebpackPlugin = require('clean-webpack-plugin')

module.exports = function (config) {
  return {
    context: path.resolve('./src'),
    entry: [
      'babel-polyfill',
      './app.js'
    ],
    output: {
      path: path.resolve('./dist'),
      filename: 'bundle-[hash].js',
      publicPath: '/'
    },
    devtool: 'source-map',
    devServer: {
      historyApiFallback: true
    },
    plugins: [
      new CleanWebpackPlugin([
        'dist'
      ]),
      new webpack.DefinePlugin({
        'process.env': {
          'ENVIRONMENT': JSON.stringify(config.env)
        }
      }),
      new HtmlWebpackPlugin({
        template: 'index.ejs'
      })
    ],
    module: {
      loaders: [{
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      }]
    }
  }
}
