// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/sandwich_generator.js",
  output: {
    filename: "sandwich_generator.js",
    path: path.resolve(__dirname, "build"),
    libraryTarget: 'umd',
    library: 'sandwich_generator',
    globalObject: `(typeof self !== 'undefined' ? self : this)`
  },
  mode: 'production'
};
