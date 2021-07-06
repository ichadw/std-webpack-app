const webpack = require('webpack');
const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const dotenv = require('dotenv');
const fs = require('fs');
// const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin');

module.exports = (env) => {
  // Get the root path (assuming your webpack config is in the root of your project!)
  const currentPath = path.join(__dirname);

  // Create the fallback path (the production .env)
  const basePath = `${currentPath}/.env`;

  // We're concatenating the environment name to our filename to specify the correct env file!
  let envPath;
  if (env !== 'production') {
    envPath = `${basePath}.${env}`;
  } else {
    envPath = basePath;
  }

  // Check if the file exists, otherwise fall back to the production .env
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;

  // Set the path parameter in the dotenv config
  const fileEnv = dotenv.config({ path: finalPath }).parsed;

  // reduce it to a nice object, the same as before (but with the variables from the file)
  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    // eslint-disable-next-line no-param-reassign
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  const defineProperty = {
    'process.env.ENVIRONMENT': JSON.stringify(env),
  };

  const isProd = env === 'production';

  const envSetup = { ...defineProperty, ...envKeys };
  console.log(envSetup);

  return {
    entry: './src',
    devtool: 'eval',
    mode: isProd ? 'production' : 'development',
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, 'dist'),
      publicPath: '/',
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          exclude: /node_modules/,
          use: ['file-loader?name=[name].[ext]']
        },
        {
          test: /\.(woff|woff2|eot|ttf|svg)$/,
          loader: 'url-loader?limit=100000',
        },
        {
          test: /\.(csv|tsv)$/,
          use: ['csv-loader'],
        },
        {
          test: /\.xml$/,
          use: ['xml-loader'],
        },
        {
          test: /npm\.js$/,
          loader: 'string-replace-loader',
          include: path.resolve('node_modules/firebaseui/dist'),
          options: {
            search: "require('firebase/app');",
            replace: "require('firebase/app').default;",
          },
        },
      ],
    },
    devServer: {
      open: 'chrome',
      historyApiFallback: {
        disableDotRule: true,
      },
      disableHostCheck: true,
    },
    resolve: {
      alias: {
        // '@constants': path.resolve(__dirname, './src/constants'),
      },
    },
    plugins: [
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.DefinePlugin(envSetup),
      new HtmlWebPackPlugin({
        template: './public/index.html',
        filename: './index.html',
        favicon: './public/favicon.ico',
        minify: {
          removeComments: true,
        },
      }),
      new webpack.optimize.ModuleConcatenationPlugin(),
    ],
  };
};
