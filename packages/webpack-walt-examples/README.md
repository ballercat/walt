# Webpack Examples
Examples of how to load Walt modules inside a larger app with Webpack.

## Usage

Install:
`npm install`

Run:
`npm start`

## Webpack config
Here is the the most basic configuration necessary to seemlessly import a `.walt`
module into your project:

```js
module.exports = {
  context: __dirname + "/src",

  devtool: "source-map",

  entry: {
    javascript: "./index.js"
  },

  output: {
    filename: "./example.js"
  },

  resolve: {
    extensions: [".js", ".jsx", ".walt"]
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
        loader: "walt-loader"
      }
    ]
  }
};
```
