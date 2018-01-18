const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")

module.exports = {
  entry: "./src/beepad_client.js",
  output: {
    filename: "client.js",
    path: path.resolve(__dirname, "dist"),
    library: "home"
  },
  resolve: {
    modules: [
      path.resolve("./src"),
      path.resolve("./node_modules")
    ]
  },
  plugins: [
      new UglifyJsPlugin({
        include: /\/src/
      })
  ]
};