import test from "ava";
import parseContstant from "../parser/constant";
import parseExpression from "../parser/expression";
import { mockContext } from "../utils/mocks";
import compile from "..";

const compileAndRun = src => WebAssembly.instantiate(compile(src));

test("types of constants", t => {
  const ctx = mockContext("0.5");
  const node = parseContstant(ctx);
  t.snapshot(node);
});

test("typecasts are patched in binary expressions", t => {
  const ctx = mockContext("(x: f32) + 5.0");
  ctx.globals = [
    {
      value: "x",
      type: "i32",
    },
  ];

  // The Pair of (x: f32) should become a TypeCast (to, from)
  const node = parseExpression(ctx);
  t.snapshot(node);
});

test("correct typecasts for constants", t => {
  const ctx = mockContext("(2.0: i32) + 2");
  const node = parseExpression(ctx);
  t.snapshot(node);
});

test("correct typecasts for float constants", t => {
  const ctx = mockContext("2.5 + (2: f32) + 0.5");
  const node = parseExpression(ctx);
  t.snapshot(node);
});

test("float to int typecasts are compiled", t =>
  compileAndRun(`
      export function echo() : i32 {
        return (2.5 : i32) + 2;
      }
    `).then(result => {
    t.is(result.instance.exports.echo(), 4);
  }));

test("int to float typecasts are compiled", t =>
  compileAndRun(`
      export function echo() : f32 {
        return 2.5 + (2 : f32) + 0.5;
      }
    `).then(result => {
    t.is(result.instance.exports.echo(), 5);
  }));

test("binary expressions, are type promoted when necessary", t => {
  const ctx = mockContext("2.5 + 2 + 0.5 * (10 / 5);");
  ctx.globals = [{ value: "x", type: "i32" }];
  const node = parseExpression(ctx);
  t.snapshot(node);
});

test("binary expression results can be typecast", t => {
  const ctx = mockContext("(10 + 5): f32");
  ctx.globals = [{ value: "x", type: "i32" }];
  const node = parseExpression(ctx);
  t.snapshot(node);
});
