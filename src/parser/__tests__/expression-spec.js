import test from "ava";
import expression from "../expression";
import { TYPE_USER, TYPE_ARRAY } from "../metadata";
import { mockContext } from "../../utils/mocks";
import printNode from "../../utils/print-node";

test("array: offset is constant", t => {
  const ctx = mockContext("b[1] + 5");
  ctx.globals = [
    { id: "b", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "i32" }] }
  ];
  const node = expression(ctx);
  t.snapshot(node);
});

test("array: offset is compound expression", t => {
  const ctx = mockContext("a + b[1 + 1] * 5");
  ctx.globals = [
    { id: "b", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "i32" }] },
    { id: "a", type: "i32" }
  ];
  const node = expression(ctx);
  t.snapshot(node);
});

test("sequence, of constants", t => {
  const ctx = mockContext("1, 2, 3");
  const node = expression(ctx);
  t.snapshot(node);
});

test("sequence, of compound expressions", t => {
  const ctx = mockContext("1, 1 + 1, (2 * 3) / 2, 11");
  const node = expression(ctx);
  t.snapshot(node);
});

test("function calls", t => {
  const ctx = mockContext("test(1, 2 + 2 * 3, 3);");
  ctx.func = {
    locals: []
  };
  ctx.functions = [
    {
      id: "test",
      meta: []
    }
  ];
  const node = expression(ctx);
  t.snapshot(node);
});

test("function calls in expressions", t => {
  const ctx = mockContext("2 + test();");
  ctx.func = {
    locals: []
  };
  ctx.functions = [
    {
      id: "test",
      result: "i32",
      meta: []
    }
  ];
  const node = expression(ctx);
  t.snapshot(node);
});

test("function parameters", t => {
  const ctx = mockContext("test(2);");

  ctx.func = {
    locals: []
  };
  ctx.functions = [
    {
      id: "test",
      meta: []
    }
  ];
  const node = expression(ctx);
  t.snapshot(node);
});

test("object literal", t => {
  const ctx = mockContext("{ 'one': 1 + 1 * 3, 'two': 2 }");
  const node = expression(ctx);
  t.snapshot(node);
});

test("type definition", t => {
  const ctx = mockContext("{ 'foo': i32, 'bar': i32 }");
  const node = expression(ctx);
  t.snapshot(node);
});

test("array subscript inside a return statement", t => {
  const ctx = mockContext("return x[0] + x[1];");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  const node = expression(ctx);
  t.snapshot(node);
});

test("array subscripts on float variables", t => {
  const ctx = mockContext("x[0] + 5;");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  const node = expression(ctx);
  t.snapshot(node);
});

test("unary negation, simple", t => {
  const ctx = mockContext("-1");
  const node = expression(ctx);
  t.snapshot(node);
});

test("unary negation, array subscript", t => {
  const ctx = mockContext("x[0] = -x[0];");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  t.snapshot(printNode(expression(ctx)));
});

test("unary negation, superfluous plus operator", t => {
  const ctx = mockContext("2 + - 1");
  const node = expression(ctx);
  t.snapshot(node);
});

test("unary negation, does not break math", t => {
  const ctx = mockContext("2 + (2 - 1)");
  const node = expression(ctx);
  t.snapshot(node);
});

test("unary negation, variables in expressions", t => {
  const ctx = Object.assign(mockContext("-x + 2 * 3"), {
    globals: [{ id: "x", type: "f32" }]
  });
  const node = expression(ctx);
  t.snapshot(node);
});
