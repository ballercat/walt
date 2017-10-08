const code = `export function test(): i32 {
  const arr: i32[] = new Array(10);
  arr[0] = 20;
  arr[1] = 15;
  return arr[0] + arr[1];
}`;

const label = "Memory (console)";

function compile(buffer) {
  const memory = new WebAssembly.Memory({ initial: 1 });
  return WebAssembly.instantiate(buffer, {
    env: { memory, new: () => 0 }
  }).then(result => {
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
