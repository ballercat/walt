import test from "ava";
import path from "path";
import wrap from "../wrap";
import Module from "module";

const __TEST_MODULE_NAME__ = "__TEST_MODULE_NAME__";

test("wrap returns a JS wrapper module around wasm", t => {
  const autoBuild = wrap(path.resolve(__dirname, "../../demo/index.walt"));
  const module = new Module(__TEST_MODULE_NAME__, null);
  module._compile(autoBuild, __TEST_MODULE_NAME__);
  const exports = module.exports;

  t.is(typeof exports === "function", true);
  return exports({
    env: { memory: new WebAssembly.Memory({ initial: 1 }) }
  }).then(result => {
    // the walt module should return indexOf('World', 'Hello World');
    t.is(result.instance.exports.run(), 6);

    // cleanup fake module
    Module._cache[__TEST_MODULE_NAME__] = null;
  });
});
