import test from "ava";
import path from "path";
import wrap from "../wrap";
import Module from "module";

test("cli wrap command", t => {
  const autoBuild = wrap(path.resolve(__dirname, "../../demo/index.walt"));
  t.is(typeof autoBuild === "string", true, "wrap returns a string");
});

const __TEST_MODULE_NAME__ = "__TEST_MODULE_NAME__";
test.only("wrap returns a JS wrapper module around wasm", t => {
  const autoBuild = wrap(path.resolve(__dirname, "../../demo/index.walt"));
  const module = new Module(__TEST_MODULE_NAME__, null);
  module._compile(autoBuild, __TEST_MODULE_NAME__);
  const exports = module.exports;

  t.is(typeof exports === "function", true);
});
