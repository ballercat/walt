import code from "./walt/closures";
import { closurePlugin } from 'walt-compiler';

const label = "Closures (console)";
window.closurePlugin = closurePlugin;

function compile(buffer) {
  // Because examples are eval-ed we need to use a window reference for the
  // closure plugin
  return WebAssembly.instantiate(window.closurePlugin()).then(plugin => {
    return WebAssembly.instantiate(
      buffer,
      {
        // Closure imports can also be user defined
        closure: {
          'closure--get': plugin.instance.exports.make,
          'closure--get-i32': plugin.instance.exports.geti32,
          'closure--set-i32': plugin.instance.exports.seti32
        }
      }
    )
    .then((module) => {
      const test = module.instance.exports.test;

      console.log(test());
    });
  });
}

const example = {
  code,
  label,
  compile,
  js: compile.toString()
};

export default example;
