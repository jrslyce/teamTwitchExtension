const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    panel: './panel/panel.js',
    config: './config/config.js',
    component: './component/component.js',
    mobile: './mobile/mobile.js'
  },
  output: {
    filename: '[name]/[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './panel/panel.html',
      filename: 'panel/panel.html',
      chunks: ['panel']
    }),
    new HtmlWebpackPlugin({
      template: './config/config.html',
      filename: 'config/config.html',
      chunks: ['config']
    }),
    new HtmlWebpackPlugin({
      template: './component/component.html',
      filename: 'component/component.html',
      chunks: ['component']
    }),
    new HtmlWebpackPlugin({
      template: './mobile/mobile.html',
      filename: 'mobile/mobile.html',
      chunks: ['mobile']
    }),
    new CopyPlugin({
      patterns: [
        { from: 'assets', to: 'assets' },
        { from: 'common/styles.css', to: 'common/styles.css' }
      ]
    })
  ],
  mode: 'development',
  devtool: 'inline-source-map'
};
