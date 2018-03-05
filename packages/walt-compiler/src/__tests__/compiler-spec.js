import test from "ava";
import compile from "..";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);

test("empty module compilation", t =>
  compileAndRun("").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("invalid imports throw", t =>
  t.throws(() => compile("import foo from 'bar'")));

test("compiler basics", t =>
  compileAndRun(
    `import { two: TwoType, alsoTwo: TwoType } from 'env';
  type TwoType = () => i32;
  // Memory
  const memory: Memory<{ initial: 1 }>;
  // Const globals, export
  export const bar: i32 = 2;
  let foo: i32 = 3;
  let baz: i32 = 0;
  let x: i32;

  // Function export
  export function test(): i32 {
    x = 1;
    // Local vs global, test scope
    const foo: i32 = two();
    // set global
    baz = alsoTwo();

    // global references, math
    return 2 * 2 + foo + baz;
  }

  export function testLargeSignedConstant(): i32 {
    return 126;
  }
  function number(): i64 {
    const x: i64 = 42;
    return x;
  }
  function two() : i64 {
    return 2;
  }
  export function test64BitConstants(): i32 {
    return number(): i32;
  }

  const gArray: i32[] = 0;
  export function testGlobalArray(): i32 {
    gArray[0] = 2;
    gArray[1] = 2;
    return gArray[0] + gArray[1];
  }
  const foobar: f64 = 24;
  export function testGlobali64(): f64 {
    return foobar;
  }
`,
    { env: { two: () => 2, alsoTwo: () => 2 } }
  ).then(module => {
    t.is(module.instance.exports.bar, 2);
    t.is(module.instance.exports.test(), 8);
    t.is(module.instance.exports.testLargeSignedConstant(), 126);
    t.is(module.instance.exports.testGlobalArray(), 4);
    t.is(module.instance.exports.testGlobali64(), 24);
  }));
