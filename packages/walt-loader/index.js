const wasmLoader = require("wasm-loader");
const waltCompiler = require("walt-compiler");

module.exports = function waltLoader(source) {
  const buffer = waltCompiler.default(source);
  buffer.length = buffer.byteLength;
  // The new Buffer step can/should be skipped here, maybe
  wasmLoader.call(this, new Buffer(buffer));
};
