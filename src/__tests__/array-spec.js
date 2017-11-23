import test from "ava";
import compile from "..";
import declaration from "../parser/declaration";
import { mockContext } from "../utils/mocks.js";
// import printNode from "../utils/print-node";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("array declaration", t => {
  const ctx = mockContext("let x: i32[] = 0;");
  ctx.func = {
    locals: []
  };
  const node = declaration(ctx);
  t.snapshot(node);
});

test("array subscript works on everything", t => {
  const memory = new WebAssembly.Memory({ initial: 1 });
  return compileAndRun(
    `import { memory: Memory } from 'env';

  export function test(): i32 {
    let x: i32[] = 0;
    let y: i32 = 5;
    x[0] = 21;
    x[y] = 2;
    return x[0] * x[y];
  }`,
    {
      env: { memory }
    }
  ).then(outputIs(t, 42));
});
