import test from "ava";
import { getIR, debug } from "..";

test("functions", t => {
  const walt = `
  // For pointers
  const table: Table = { element: anyfunc, initial: 10, max: 10 };
  // For object operations
  const memory: Memory = { 'initial': 1 };

  type Test = () => i32;
  type Type = { 'a': i32 };

  const x: i32 = 32;

  function callback(pointer: Test): i32 { return pointer(); }
  function result(): i32 { return 2; }
  function addOne(ptr: Type) { ptr['a'] += 1; }

  export function testParams(x: i32, y: i32) : i32 { return x + y; }
  export function testGlobalScope(): i32 { let x: i32 = 42; return x; }
  // This just needs to compile
  export function testUninitializedLocals() { const x: i32; }
  // This also tests built-in words in function names ("void")
  export function testVoidIsOptional() {}
  export function test0FunctionNames1(): i32 { return 2; }
  export function testPointerArguments(): i32 {
    let original: Type = 0;
    original['a'] = 4;
    addOne(original);
    return original['a'];
  }
  export function testFunctionPointers(): i32 {
    return callback(result) + callback(result);
  }
`;

  t.throws(() => getIR("function test() { return y; }"));
  const wasm = getIR(walt);

  t.snapshot(debug(wasm));
  return WebAssembly.instantiate(wasm.buffer(), result => {
    const exports = result.instance.exports;
    t.is(exports.testParams(2, 2), 4, "function params");
    t.is(exports.testGlobalScope(), 32, "global scope");
    t.is(exports.testVoidIsOptional(), null);
    t.is(exports.test0FunctionNames1(), 2, "numbers in function names");
    t.is(exports.testPointerArguments(), 5, "object pointer arguments");
    t.is(exports.testFunctionPointers(), 4, "plain function pointers");
  });
});
