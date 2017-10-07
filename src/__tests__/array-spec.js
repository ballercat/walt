import test from "ava";
import compile from "..";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(33), value);

test("basic array", t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  return compileAndRun(
    `
  export function test(): i32 {
    let x: i32[] = new Array(10);
    let y: i32 = 5;
    x[0] = 21;
    x[y] = 2;
    return x[0] * x[y];
  }`,
    {
      env: {
        memory,
        new: () => 0
      }
    }
  ).then(outputIs(t, 42));
});
