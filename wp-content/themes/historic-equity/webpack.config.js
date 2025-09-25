const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      main: './static/js/main.js',
      style: './static/scss/main.scss'
    },
    output: {
      path: path.resolve(__dirname, 'static/dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.(scss|css)$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('tailwindcss'),
                    require('autoprefixer')
                  ]
                }
              }
            },
            'sass-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name].[contenthash][ext]'
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css'
        })
      ] : [])
    ],
    devServer: {
      contentBase: path.join(__dirname, 'static/dist'),
      compress: true,
      port: 3000,
      hot: true
    },
    resolve: {
      extensions: ['.js', '.scss', '.css']
    },
    optimization: {
      splitChunks: {
        chunks: 'all'
      }
    }
  };
};