import code from "./walt/closures";
import { plugin, imports } from "walt-plugin-syntax-closure";
import { compile } from "walt-compiler";

const label = "Closures (console)";
window.compile = compile;
window.closurePlugin = plugin;
window.closureImports = imports;

function _compile(buffer) {
  // Because examples are eval-ed we need to use a window references
  //
  // import { compile } from 'walt-compiler';
  // import { plugin, imports  } from 'walt-plugin-syntax-closure';
  // window.compile = compile;
  // window.closurePlugin = plugin;
  // window.closureImports = imports;
  return Promise.resolve(window.closureImports(null, window.compile)).then(
    closureImports => {
      return WebAssembly.instantiate(
        buffer,
        // Closure imports can also be user defined
        closureImports
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
