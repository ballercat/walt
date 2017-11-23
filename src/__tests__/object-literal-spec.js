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
