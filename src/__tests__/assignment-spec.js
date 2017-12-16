import test from "ava";
import compile from "..";
import { mockContext } from "../utils/mocks";
import parseStatement from "../parser/statement";

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("declration assignment", t =>
  compileAndRun(
    "export function test(): i32 { let x: i32 = 2; return x; }"
  ).then(outputIs(t, 2)));
test("assigment statement", t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 2;
    x = y + 2;
    return x;
  }`).then(outputIs(t, 4)));

test("unary negation", t => {
  const ctx = mockContext("x = -3;");
  ctx.func = {
    locals: [{ id: "x", type: "i32", meta: [] }]
  };
  const node = parseStatement(ctx);
  t.snapshot(node);
});
