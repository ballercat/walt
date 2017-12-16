import test from "ava";
import compile from "..";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("function call", t =>
  compileAndRun(`
  function two(): i32 {
    return 2;
  }
  export function test(): i32 {
    return 2 + two();
  }`).then(outputIs(t, 4)));

test("function params", t =>
  compileAndRun(`
  function addTwo(x: i32): i32 {
    return x + 2;
  }
  export function test(): i32 {
    return addTwo(2);
  }`).then(outputIs(t, 4)));

test("function scope", t =>
  compileAndRun(`
  const x: i32 = 32;
  export function test(): i32 {
    let x: i32 = 42;
    return x;
  }`).then(outputIs(t, 42)));

test("undefined function vars", t =>
  t.throws(() => {
    compileAndRun(`
    const x: i32 = 99;
    export function test(): i32 {
      let x: i32 = 42;
      return y;
    }`);
  }));

test("void result type is optional", () =>
  compileAndRun(`
  export function test() {
  }`));

test("function pointers", t => {
  const table = new WebAssembly.Table({ element: "anyfunc", initial: 10 });
  return compileAndRun(
    `
      type Test = () => i32;

      function callback(pointer: Test): i32 {
        return pointer();
      }

      function result(): i32 {
        return 42;
      }

      export function test(): i32 {
        return callback(result);
      }
      `,
    {
      env: {
        table
      }
    }
  ).then(outputIs(t, 42));
});

test("pointers as function arguments", t =>
  compileAndRun(`
  type Type = { 'a': i32 };
  const memory: Memory = { 'initial': 1 };

  function addOne(ptr: Type) {
    ptr['a'] += 1;
  }
  export function test(): i32 {
    let original: Type = 0;
    original['a'] = 4;
    addOne(original);
    return original['a'];
  }`).then(outputIs(t, 5)));
