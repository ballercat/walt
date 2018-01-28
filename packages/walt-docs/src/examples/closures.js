import code from "./walt/closures";
import { closurePlugin, withPlugins } from 'walt-compiler';

const label = "Closures (console)";
window.closurePlugin = closurePlugin;
window.withPlugins = withPlugins;

function compile(buffer) {
  // Because examples are eval-ed we need to use a window reference for the
  // closure plugin and withPlugins helper method
  return WebAssembly.instantiate(window.closurePlugin()).then(closure => {
    return WebAssembly.instantiate(
      buffer,
      // Closure imports can also be user defined
      window.withPlugins({
        closure
      })
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
