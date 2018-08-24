import code from "./walt/closures";
import { dependency as closurePlugin } from "walt-plugin-syntax-closure";

const label = "Closures (console)";
window.closurePlugin = closurePlugin;

function compile(buffer) {
  // Because examples are eval-ed we need to use a window reference for the
  // closure plugin and withPlugins helper method
  //
  // import { dependency as closurePlugin } from 'walt-plugin-syntax-closure';
  // window.closurePlugin = closurePlugin;
  return WebAssembly.instantiate(window.closurePlugin().buffer()).then(
    closure => {
      return WebAssembly.instantiate(
        buffer,
        // Closure imports can also be user defined
        {
          "walt-plugin-closure": closure.instance.exports
        }
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
  compile,
  js: compile.toString()
};

export default example;
