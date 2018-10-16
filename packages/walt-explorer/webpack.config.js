const path = require("path");

module.exports = {
  context: __dirname + "/src",

  devtool: "source-map",

  entry: {
    javascript: "./index.js"
  },

  output: {
    filename: "./explorer.js"
  },

  resolve: {
    extensions: [".js", ".jsx", ".json", ".scss", ".css", ".walt"]
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ["babel-loader"]
      },
      {
        test: /\.html$/,
        loader: "file-loader?name=[name].[ext]"
      },
      {
        test: /\.walt$/,
        loader: "raw-loader"
      },
      {
        test: /\.scss$/,
        loaders: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.css$/,
        loaders: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader",
        query: { mimetype: "image/png" }
      }
    ]
  }
};
