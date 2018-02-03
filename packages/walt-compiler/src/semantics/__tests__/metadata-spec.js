import test from "ava";
import parser from "../../parser";
import withMetadata from "..";

test("function declarations", t => {
  const ast = parser(`
  function one() {
  }
  function two(x: i32) {
  }`);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("globals", t => {
  const ast = parser(`const x: i32 = 0;
  let y: f64 = 0.0;
  `);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("imports", t => {
  const ast = parser(`import { foo: FooType } from 'env';
  type FooType = () => i32;
  `);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("identifiers", t => {
  const ast = parser(`
  const x: i32 = 0;
  function test(): i32 {
    let y: i32 = x;
    let x: i32 = 1;
    return 2 + x;
  }`);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("function calls", t => {
  const ast = parser(`
  function addTwo(x: i32): i32 {
    return x + 2;
  }
  function test(): i32 {
    return addTwo(2);
  }`);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("function pointer", t => {
  const ast = parser(`
  type ignoredType = (i32) => i32;
  type TestType = () => i32;
  function callback(pointer: TestType): i32 {
    return pointer();
  }
  function result(): i32 {
    return 2;
  }
  function entry(): i32 {
    return callback(result);
  }
  `);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("array subscript", t => {
  const ast = parser(`
  function test(): i64 {
    const arr: i64[] = 0;
    arr[0] = 42;
    return arr[1];
  }`);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("struct typedefs", t => {
  const ast = parser("type Type = { 'a': i32 };");
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("struct subscript", t => {
  const ast = parser(`
  type Type = { 'a': f32 };
  function test() {
    const obj: Type = 0;
    obj['a'] = 42;
  }`);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("recursive functions", t => {
  const ast = parser(`
    export function fibonacci(n: i32): i32 {
      if (n == 0) return 0;
      if (n == 1) return 1;
      return fibonacci(n - 1) + fibonacci(n - 2);
    }
  `);
  const astWithMetadata = withMetadata(ast);
  t.snapshot(astWithMetadata);
});

test("ternaries", t => {
  const ast = withMetadata(
    parser(`
  export function test(n: i32): i32 {
    const x: i32 = n > 0 ? n : 0;
    return x;
  }`)
  );
  t.snapshot(ast);
});
