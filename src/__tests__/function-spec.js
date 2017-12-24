import test from "ava";
import { mockContext } from "../utils/mocks";
// import printNode from "../utils/print-node";
import parseFunction from "../parser/maybe-function-declaration";
import { OBJECT_KEY_TYPES, TYPE_OBJECT } from "../parser/metadata";
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

test("non initialized locals", () =>
  compileAndRun(`
  export function test() {
    const x: i32;
  }`));

test("i64 locals", t =>
  compileAndRun(`
  export function test(): i32 {
    const x: i64 = 42;
    return x: i32;
  }`).then(outputIs(t, 42)));

test("function pointers", t => {
  const table = new WebAssembly.Table({ element: "anyfunc", initial: 10 });
  return compileAndRun(
    `
      import { table: Table } from 'env';
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
        table,
      },
    }
  ).then(outputIs(t, 42));
});

test("table max can be set", () =>
  compileAndRun(
    "const table: Table = { 'element': 'anyfunc', 'initial': 1, 'max': 2 };"
  ));
test("function pointers, multiple, with table declared", t =>
  compileAndRun(
    `
      const table: Table = { 'element': 'anyfunc', 'initial': 10 };
      type Test = () => i32;

      function callback(pointer: Test): i32 {
        return pointer();
      }

      function result(): i32 {
        return 2;
      }

      export function test(): i32 {
        return callback(result) + callback(result);
      }
      `
  ).then(outputIs(t, 4)));
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

test("function parser", t => {
  const ctx = mockContext(`function test(): i32 {
    let original: Type = 0;
    original['a'] = 4;
    return original['a'];
  }`);
  ctx.userTypes = {
    Type: {
      value: "Type",
      type: "i32",
      meta: [
        { type: OBJECT_KEY_TYPES, payload: { a: "i32" } },
        { type: TYPE_OBJECT, payload: { a: 4 } },
      ],
      params: [],
    },
  };
  const node = parseFunction(ctx);
  t.snapshot(node);
});
