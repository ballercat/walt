import parseContstant from "../parser/constant";
import parseExpression from "../parser/expression";
import { mockContext } from "../utils/mocks";
import compile from "..";

const compileAndRun = src => WebAssembly.instantiate(compile(src));

test("types of constants", () => {
  const ctx = mockContext("0.5");
  const node = parseContstant(ctx);
  expect(node).toMatchSnapshot();
});

test("typecasts are patched in binary expressions", () => {
  const ctx = mockContext("(x: f32) + 5.0");
  ctx.globals = [
    {
      id: "x",
      type: "i32"
    }
  ];

  // The Pair of (x: f32) should become a TypeCast (to, from)
  const node = parseExpression(ctx);
  expect(node).toMatchSnapshot();
});

test("correct typecasts for constants", () => {
  const ctx = mockContext("(2.0: i32) + 2");
  const node = parseExpression(ctx);
  expect(node).toMatchSnapshot();
});

test("correct typecasts for float constants", () => {
  const ctx = mockContext("2.5 + (2: f32) + 0.5");
  const node = parseExpression(ctx);
  expect(node).toMatchSnapshot();
});

test("float to int typecasts are compiled", () => compileAndRun(`
    export function echo() : i32 {
      return (2.5 : i32) + 2;
    }
  `).then(result => {
  expect(result.instance.exports.echo()).toBe(4);
}));

test("int to float typecasts are compiled", () => compileAndRun(`
    export function echo() : f32 {
      return 2.5 + (2 : f32) + 0.5;
    }
  `).then(result => {
  expect(result.instance.exports.echo()).toBe(5);
}));

test("binary expressions, are type promoted when necessary", () => {
  const ctx = mockContext("2.5 + 2 + 0.5 * (10 / 5);");
  ctx.globals = [{ id: "x", type: "i32" }];
  const node = parseExpression(ctx);
  expect(node).toMatchSnapshot();
});

test("binary expression results can be typecast", () => {
  const ctx = mockContext("(10 + 5): f32");
  ctx.globals = [{ id: "x", type: "i32" }];
  const node = parseExpression(ctx);
  expect(node).toMatchSnapshot();
});
