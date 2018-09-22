import code from "./walt/closures";
import { plugin } from "walt-plugin-syntax-closure";
import { compile } from "walt-compiler";

const label = "Closures (console)";
window.compile = compile;
window.closurePlugin = plugin;

function _compile(buffer) {
  // Because examples are eval-ed we need to use a window reference for the
  // closure plugin and withPlugins helper method
  //
  // import { compile } from 'walt-compiler';
  // import { plugin as closurePlugin } from 'walt-plugin-syntax-closure';
  // window.compile = compile;
  // window.closurePlugin = closurePlugin;
  return Promise.resolve(closurePlugin().imports(null, window.compile)).then(
    imports => {
      return WebAssembly.instantiate(
        buffer,
        // Closure imports can also be user defined
        imports
      ).then(module => {
        const test = module.instance.exports.test;

        console.log(test());
      });
    }
  );
}

const example = {
  code,
  label,
  compile: _compile,
  js: _compile.toString(),
  extensions: [plugin]
};

export default example;
