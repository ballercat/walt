# Walt Alternative WebAssembly Syntax Loader for Webpack
:zap: The most efficient way to experiment with WebAssembly to date. No need to
learn C/C++ or Rust, hand roll your wasm modules and use them within minutes with
familiar JavaScript-like syntax!

This loader is for [Walt](https://github.com/ballercat/walt), an alternative syntax for wasm. Allowing you
to write JavaScript-like `.walt` scripts and import the compiled wasm binary directly into
your JS Application.

### Install

`npm install --save-dev walt-compiler walt-loader`

## Usage
The loader user [wasm-loader](https://github.com/ballercat/wasm-loader#include-wasm-from-your-code)
under the hood and has the same API. Resolving to a factory function which returns
a promise for the WebAssembly module.

### With Webpack
Make sure you have a working Webpack config and that the `walt-compiler` package is
installed and ready to use. Then update your wepback config:

Resolve the `.walt` file extensions
```js
resolve: {
  extensions: [".walt"]
}
```

and append the `walt-loader` to loaders config option
```js
module: {
  loaders: {
    {
      test: /\.walt$/,
      loader: "walt-loader"
    }
  }
}
```

### Importing Walt Modules directly
Fire up your favorite editor and create a simple `.walt` Module file. Here is a
counter module example:

_counter.walt_:

```js
let counter: i32 = 0;

export function decrement(): i32 {
  counter -= 1;
  return counter;
}

export function increment(): i32 {
  counter += 1;
  return counter;
}
```

Once you have your module written, then you can import it into your existing JavaScript Application.

_example.js_:

```js
import makeCounter from './walt/counter';

makeCounter().then(wasmModule => {
  console.log(wasmModule.instance.exports.increment()); // 1
  console.log(wasmModule.instance.exports.increment()); // 2
  console.log(wasmModule.instance.exports.increment()); // 1
});
```

That's it. You can now write your wasm binaries and import them directly into your Webpack App!

