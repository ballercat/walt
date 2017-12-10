import test from "ava";
import compile from "..";
import statement from "../parser/statement";
import { TYPE_ARRAY } from "../parser/metadata";
import { mockContext } from "../utils/mocks";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("memory can be defined", t => {
  return compileAndRun(
    `
  const memory: Memory = { 'initial': 2 };

  export function test(): i32 {
    let x: i32[] = 0;
    let y: i32 = 5;
    x[0] = 21;
    x[y] = 2;
    return x[0] * x[y];
  }`
  ).then(outputIs(t, 42));
});

test("memory store on float arrays", t => {
  const ctx = mockContext("x[0] = 2.0;");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  const node = statement(ctx);
  t.snapshot(node);
});
