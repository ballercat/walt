import expression from "../expression";
import { TYPE_ARRAY } from "../metadata";
import { mockContext } from "../../utils/mocks";
import printNode from "../../utils/print-node";

test("array: offset is constant", () => {
  const ctx = mockContext("b[1] + 5");
  ctx.globals = [
    { id: "b", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "i32" }] }
  ];
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("array: offset is compound expression", () => {
  const ctx = mockContext("a + b[1 + 1] * 5");
  ctx.globals = [
    { id: "b", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "i32" }] },
    { id: "a", type: "i32" }
  ];
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("sequence, of constants", () => {
  const ctx = mockContext("1, 2, 3");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("sequence, of compound expressions", () => {
  const ctx = mockContext("1, 1 + 1, (2 * 3) / 2, 11");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("function calls", () => {
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
  expect(node).toMatchSnapshot();
});

test("function calls in expressions", () => {
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
  expect(node).toMatchSnapshot();
});

test("function parameters", () => {
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
  expect(node).toMatchSnapshot();
});

test("object literal", () => {
  const ctx = mockContext("{ 'one': 1 + 1 * 3, 'two': 2 }");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("type definition", () => {
  const ctx = mockContext("{ 'foo': i32, 'bar': i32 }");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("array subscript inside a return statement", () => {
  const ctx = mockContext("return x[0] + x[1];");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("array subscripts on float variables", () => {
  const ctx = mockContext("x[0] + 5;");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("unary negation, simple", () => {
  const ctx = mockContext("-1");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("unary negation, array subscript", () => {
  const ctx = mockContext("x[0] = -x[0];");
  ctx.func = {
    locals: [
      { id: "x", type: "i32", meta: [{ type: TYPE_ARRAY, payload: "f32" }] }
    ]
  };
  expect(printNode(expression(ctx))).toMatchSnapshot();
});

test("unary negation, superfluous plus operator", () => {
  const ctx = mockContext("2 + - 1");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("unary negation, does not break math", () => {
  const ctx = mockContext("2 + (2 - 1)");
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});

test("unary negation, variables in expressions", () => {
  const ctx = Object.assign(mockContext("-x + 2 * 3"), {
    globals: [{ id: "x", type: "f32" }]
  });
  const node = expression(ctx);
  expect(node).toMatchSnapshot();
});
