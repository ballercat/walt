const wasmLoader = require("wasm-loader");
const { compile } = require("walt-compiler");

module.exports = function waltLoader(source) {
  const buffer = compile(source).buffer();
  buffer.length = buffer.byteLength;
  // The new Buffer step can/should be skipped here, maybe
  wasmLoader.call(this, new Buffer(buffer));
};
