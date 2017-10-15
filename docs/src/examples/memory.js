const code = `// Memory type is a special global pre-defined type
const memory: Memory = { 'initial': 1 };

// An object of Memory type must be defined(can be imported)
// to enable memory operations

export function test(): i32 {
  // Because WebAssembly has no 'real' arrays everything is just flat memory
  // there isn't a need for special Array syntax, anything can be used as an
  // offset.
  const arr: i32 = 0;
  // The below line is still valid in JavaScript...
  arr[0] = 20;
  arr[1] = 15;

  // This should return 35
  return arr[0] + arr[1];
}`;

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
