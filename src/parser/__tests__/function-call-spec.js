import test from "ava";
import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("function call, no arguments", t => {
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
  t.snapshot(nodes);
});

test("function call, in a return", t => {
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
  t.snapshot(nodes);
});

test("functions must return correct types", t => {
  const ctx = mockContext("function test(): i32 { let f: f32 = 0; return f; }");
  t.throws(() => statement(ctx));
});

test("return statmements are only valid inside functions", t => {
  const ctx = mockContext("return 14;");
  t.throws(() => statement(ctx));
});
