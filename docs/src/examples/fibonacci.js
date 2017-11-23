import code from "./walt/fibonacci";

const label = "Fibonacci (console)";

function compile(buffer) {
  return WebAssembly.instantiate(buffer).then(result => {
    const fib = result.instance.exports.fibonacci;
    [...Array(41).keys()].forEach(v => {
      console.log(`Fibonacci for ${v} - ${fib(v)}`);
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
