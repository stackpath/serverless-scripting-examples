const webpack = require('webpack');
const Path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

process.env.JWKS_KID = process.env.JWKS_KID || '';
process.env.JWKS_URL = process.env.JWKS_URL || '';

if (process.env.JWKS_KID === '' || process.env.JWKS_URL === '') {
  console.error('');
  console.error('**** WARNING: Compiling script without setting the JWKS settings. ****');
  console.error('');
}

module.exports = {
  mode: 'development',
  entry: Path.resolve(__dirname, 'src/index.js'),
  output: {
    path: Path.join(__dirname, 'build'),
    filename: 'bundle.js',
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new CleanWebpackPlugin(['build'], {
      root: Path.resolve(__dirname),
    }),
    new webpack.DefinePlugin({
      'process.env': {
        JWKS_URL: JSON.stringify(process.env.JWKS_URL),
        JWKS_KID: JSON.stringify(process.env.JWKS_KID),
      },
    }),
  ],
  resolve: {
    alias: {
      '~': Path.resolve(__dirname, 'src'),
    },
  },
};
