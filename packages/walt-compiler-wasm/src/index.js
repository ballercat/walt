const link = require("walt-link");
const path = require("path");
const wasmBuffer = require("./wasm-buffer");
const build = link(path.resolve(__dirname, "index.walt"));

/**
 * Walt Compiler
 *
 * Uses WebAssembly internally/is self-hosted
 *
 * @param {String} source Source input
 */
module.exports = function compile(source) {
  const memory = new WebAssembly.Memory({
    initial: 1,
  });
  return build({
    env: {
      memory,
    },
  }).then(result => {
    const buffer = wasmBuffer({ memory }, result.instance.exports.compile());
  });
};
