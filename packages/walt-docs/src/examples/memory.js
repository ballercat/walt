import code from "./walt/memory";

const label = "Memory (console)";

function compile(buffer) {
  return WebAssembly.instantiate(buffer).then(result => {
    const exports = result.instance.exports;
    console.log(exports.test());
  });
}

const example = {
  code,
  label,
  compile,
  js: compile.toString()
};

export default example;
