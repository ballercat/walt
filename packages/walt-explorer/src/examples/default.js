import code from "./walt/default";

const label = "Simple (console)";

function compile(buffer) {
  return WebAssembly.instantiate(buffer).then(result => {
    const exports = result.instance.exports;
    console.log(exports.echo());
  });
}

const example = {
  code,
  label,
  compile,
  js: compile.toString()
};

export default example;
