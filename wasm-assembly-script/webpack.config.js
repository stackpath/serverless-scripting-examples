module.exports = {
  mode: 'production',
  target: 'webworker',
  devtool: false,
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: 'javascript/auto',
        loader: 'arraybuffer-loader',
      },
    ],
  },
};
