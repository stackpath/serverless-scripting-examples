const Dotenv = require("dotenv-webpack");

module.exports = {
  entry: "./index.js",
  mode: "production",
  target: "webworker",
  plugins: [new Dotenv()],
  optimization: {
    minimize: true
  }
};
