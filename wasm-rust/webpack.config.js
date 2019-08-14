const path = require('path')
const webpack = require('webpack')
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin')

module.exports = (env, argv) => {
  return {
    devtool: '',
    entry: './src/index.ts',
    output: {
      filename: 'index.js',
      // Needed to not use "window" as global
      globalObject: 'this'
    },
    resolve: {
      extensions: ['.js', '.ts', '.wasm']
    },
    module: {
      rules: [
        // Custom WASM loader
        {
          test: /\.wasm$/,
          type: 'javascript/auto',
          loader: path.resolve(__dirname, './wasm_loader.js')
        },
        { test: /\.ts$/, loader: 'ts-loader' }
      ]
    },
    plugins: [
      new WasmPackPlugin({
        crateDirectory: path.resolve(__dirname, './rust-image'),
        forceMode: argv.mode
      }),
      // The script gets so large webpack starts chunking it which we don't want
      new webpack.optimize.LimitChunkCountPlugin({ maxChunks: 1 })
    ]
  }
}