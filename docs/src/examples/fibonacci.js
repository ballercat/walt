const code = `export function fibonacci(n: i32): i32 {
  if (n == 0)
    return 0;
  if (n == 1)
    return 1;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

const label = "Fibonacci (console)";

function compile(buffer) {
  return WebAssembly.instantiate(buffer).then(result => {
    const fib = result.instance.exports.fibonacci;
    const results = [...Array(11).keys()].map(fib);
    console.log(`Fibonacci results 0 - 10`);
    console.log(results);
  });
}

const example = {
  code,
  label,
  compile,
  js: compile.toString()
};

export default example;
