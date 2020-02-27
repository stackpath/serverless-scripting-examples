module.exports = {
  entry: './index.js',
  mode: 'production',
  target: 'webworker',
  optimization: {
    minimize: true,
  },
};
