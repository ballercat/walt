import test from "ava";
import compile, { getIR, debug, withPlugins } from "..";
import closurePlugin from "../closure-plugin";

test.only("default arguments", t => {
  const walt = `
  import { extern: Add } from 'env';
  type Add = (i32, i32 = 0) => i32;
  function add(x: i32, y: i32 = 1): i32 {
    return x + y;
  }

  export function test(): i32 {
    const x: i32 = add(2);
    const y: i32 = extern(1);
    return x + y;
  }`;

  return WebAssembly.instantiate(compile(walt), {
    env: { extern: (k, i) => k + i },
  }).then(mod => {
    t.is(mod.instance.exports.test(), 4);
  });
});

test("functions", t => {
  const walt = `
  // For pointers
  const table: Table<{ element: anyfunc, initial: 10, max: 10 }>;
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
  };
`;
  t.throws(() => getIR("function test() { return y; }"));
  const wasm = getIR(walt);
  t.snapshot(debug(wasm));
  return WebAssembly.instantiate(wasm.buffer()).then(result => {
    const exports = result.instance.exports;
    t.is(exports.testParams(2, 2), 4, "function params");
    t.is(exports.testGlobalScope(), 42, "local scope > global scope");
    t.is(exports.testVoidIsOptional() == null, true);
    t.is(exports.test0FunctionNames1(), 2, "numbers in function names");
    t.is(exports.testPointerArguments(), 5, "object pointer arguments");
    t.is(exports.testFunctionPointers(), 4, "plain function pointers");
    t.is(exports.testArrayArguments(), 5, "array arguments");
  });
});

test("closures", t => {
  const source = `
const table: Table<{ element: anyfunc, initial: 5 }>;
type Func = (i32, i32) => i32;
type Simple = () => i32;
type Void = () => void;
type ArgsOnly = (i32, i32) => void;

type Closure = Lambda<Func>;
type SimpleClosure = Lambda<Simple>;
type VoidClosure = Lambda<Void>;
type ArgsOnlyClosure = Lambda<ArgsOnly>;

function getSimpleLambda(): SimpleClosure {
  let x: i32 = 0;
  const z: i64 = (1 : i64);
  return (): i32 => {
    // assignment here, we need to cover regular assignment in closures
    let y: i32 = 0;
    y = z: i32;
    x += y;
    return x;
  }
}

function getLambda(): Closure {
  // close over two locals
  let x: i32 = 0;
  return (xx: i32, yy: i32): i32 => {
    x += yy;
    return x + xx;
  }
}

// Closures below are not useful, but necessary to cover all scenarios
function getVoidLamba(): VoidClosure {
  let x: i32 = 0;
  return () => {
    x += 1;
  }
}

function getArgsOnlyLambda(): ArgsOnlyClosure {
  let x: i32 = 0;
  return (z: i32, y: i32) => {
    x+= z + y;
  }
}

export function test(): i32 {
  const closure: Closure = getLambda();
  // should be 5
  const x: i32 = closure(2, 3);

  const closure2: SimpleClosure = getSimpleLambda();
  // should be 1
  closure2();
  // should be 2
  const y: i32 = closure2();

  // should be 7
  return x + y;
}
`;

  return WebAssembly.instantiate(closurePlugin())
    .then(closure =>
      WebAssembly.instantiate(
        compile(source, { encodeNames: true }),
        withPlugins({
          closure,
        })
      )
    )
    .then(result => {
      const fn = result.instance.exports.test;
      t.is(fn(), 7);
    });
});
