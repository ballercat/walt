import test from 'ava';
import { compile, getIR } from '..';

test('default arguments', t => {
  const walt = `
  import { extern: Add } from 'env';
  type Add = (i32, i32 = 0) => i32;
  function add(x: i32, y: i32 = 1): i32 {
    return x + y;
  }

  export function test(): i32 {
    const x: i32 = add(2);
    const y: i32 = extern(1, 0);
    return x + y;
  }`;

  return WebAssembly.instantiate(compile(walt).buffer(), {
    env: { extern: (k, i) => k + i },
  }).then(mod => {
    t.is(mod.instance.exports.test(), 4);
  });
});

test('function pointer', t => {
  const walt = `
    // shadowing variables should be OK
    export function test(): i32 {
      // Definiong an identifier which is a function name
      const test: i32 = 42;

      // The function pointer parser should defer to available scopes first, and
      // not re-map this identifier to a pointer.
      return test;
    }
  `;

  return WebAssembly.instantiate(compile(walt).buffer()).then(mod => {
    t.is(mod.instance.exports.test(), 42);
  });
});

test('functions', t => {
  const walt = `
  // For pointers
  const table: Table<{ element: 'anyfunc', initial: 10, max: 10 }>;
  // For object operations
  const memory: Memory<{ initial: 1 }>;

  type Test = () => i32;
  type Type = { a: i32 };

  const x: i32 = 32;

  function callback(pointer: Test): i32 { return pointer(); }
  function result(): i32 { return 2; }
  function addOne(ptr: Type) { ptr.a += 1; }

  export function testParams(x: i32, y: i32) : i32 { return x + y; }
  export function testGlobalScope(): i32 { let x: i32 = 42; return x; }
  // This just needs to compile
  export function testUninitializedLocals() { let x: i32; }
  // This also tests built-in words in function names ("void")
  export function testVoidIsOptional() {}
  export function test0FunctionNames1(): i32 { return 2; }
  export function testPointerArguments(): i32 {
    let original: Type = 0;
    original.a = 4;
    addOne(original);
    return original.a;
  }
  export function testFunctionPointers(): i32 {
    return callback(result) + callback(result);
  }

  function addArray(arr: i32[], x: i32, y: i32): i32 {
    return arr[x] + arr[y];
  }

  export function testArrayArguments(): i32 {
    const arr: i32[] = 24;
    arr[0] = 2;
    arr[4] = 3;
    return addArray(arr, 0, 4);
  }
`;
  t.throws(() => getIR('function test() { return y; }'));
  const wasm = getIR(walt);
  return WebAssembly.instantiate(wasm.buffer()).then(result => {
    const exports = result.instance.exports;
    t.is(exports.testParams(2, 2), 4, 'function params');
    t.is(exports.testGlobalScope(), 42, 'local scope > global scope');
    t.is(exports.testVoidIsOptional() == null, true);
    t.is(exports.test0FunctionNames1(), 2, 'numbers in function names');
    t.is(exports.testPointerArguments(), 5, 'object pointer arguments');
    t.is(exports.testFunctionPointers(), 4, 'plain function pointers');
    t.is(exports.testArrayArguments(), 5, 'array arguments');
  });
});
