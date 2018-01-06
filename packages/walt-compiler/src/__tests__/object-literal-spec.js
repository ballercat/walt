import test from "ava";
import compile from "..";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("types and assignment", t => {
  return compileAndRun(
    `
  const memory: Memory = { 'initial': 1 };

  type TestType = { 'foo': i32, 'bar': i32 };

  export function test(): i32 {
    let obj: TestType = 0;

    obj['foo'] = 42;
    obj['bar'] = 20;

    return obj['foo'] + obj['bar'];
  }`
  ).then(outputIs(t, 62));
});

test("object indexing and alignment", t => {
  return compileAndRun(
    `const memory: Memory = { 'initial': 1 };
    type TestType = { 'foo': i32, 'bar': i32 };
    export function test(): i32 {
      let obj: TestType = 0;
      let arr: i32[] = 0;

      obj['foo'] = 42;
      obj['bar'] = 20;

      return arr[0] + arr[1];
    }`
  ).then(outputIs(t, 62));
});

test("float types", t => {
  return compileAndRun(
    `const memory: Memory = { 'initial': 1 };
    type TestType = { 'foo': i32 };
    export function test(): f32 {
      let obj: f32[] = 0;
      obj[1] = 2.0;

      return obj[1];
    }
    `
  ).then(outputIs(t, 2));
});

test("8 byte and 4 byte properties", t =>
  compileAndRun(`
  const memory: Memory = { 'initial': 1 };
  type TestType = { 'foo': i32, 'bar': i64, 'foobaz': i32, 'baz': f64 };
  export function test(): f32 {
    const obj: TestType = 0;
    obj['baz'] = (126: f64);
    return obj['baz']: f32;
  }`).then(outputIs(t, 126)));

test("compound assign", t =>
  compileAndRun(`
  const memory: Memory = { 'initial': 1 };
  type TestType = { x: i32, y: i32, z: i32 };
  export function test(): i32 {
    const obj: TestType = 0;
    obj = { x: 2, y: 2 };
    return obj['x'] + obj['y'];
  }`).then(outputIs(t, 4)));

test("object spread", t =>
  compileAndRun(`
  const memory: Memory = { 'initial': 1 };
  type TestType = { x: i32, y: i32, z: i32 };
  export function test(): i32 {
    const obj: TestType = 0;
    const obj2: TestType = sizeof(TestType);
    obj2 = { x: 2, y: 2 };
    obj = { ...obj2, z: 2 };
    return obj['x'] + obj['y'] + obj['z'];
  }`).then(outputIs(t, 6)));
