import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("function call, no arguments", () => {
  const ctx = mockContext("test();");
  ctx.func = {
    locals: []
  };
  ctx.functions = [
    {
      id: "test",
      meta: [],
      result: "i32"
    }
  ];
  const nodes = statement(ctx);
  expect(nodes).toMatchSnapshot();
});

test("function call, in a return", () => {
  const ctx = mockContext("return test();");
  ctx.func = {
    locals: []
  };
  ctx.functions = [
    {
      id: "test",
      meta: []
    }
  ];
  const nodes = statement(ctx);
  expect(nodes).toMatchSnapshot();
});

test("functions must return correct types", () => {
  const ctx = mockContext("function test(): i32 { let f: f32 = 0; return f; }");
  expect(() => statement(ctx)).toThrow();
});

test("return statmements are only valid inside functions", () => {
  const ctx = mockContext("return 14;");
  expect(() => statement(ctx)).toThrow();
});
