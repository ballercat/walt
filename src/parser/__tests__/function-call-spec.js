import test from "ava";
import statement from "../statement";
import { mockContext, mockFunction } from "../../utils/mocks";

test("function call, no arguments", t => {
  const ctx = mockFunction(mockContext("test();"), {
    value: "test",
    meta: [],
    result: "i32",
  });
  const nodes = statement(ctx);
  t.snapshot(nodes);
});

test("function call, in a return", t => {
  const ctx = mockFunction(mockContext("return test();"), {
    value: "test",
    meta: [],
  });
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
