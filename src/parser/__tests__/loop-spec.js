import statement from "../statement";
import test from "ava";
import { mockContext } from "../../utils/mocks";

test("while parser", t => {
  const ctx = mockContext("while (x < 10) { x += 1; }");
  ctx.globals = [{ value: "x", type: "i32" }];
  const node = statement(ctx);
  t.snapshot(node);
});

test("for loop parser", t => {
  const ctx = mockContext("for(i = 0; i < 10; i += 1){ x += i; }");
  ctx.globals = [{ value: "x", type: "i32" }, { value: "i", type: "i32" }];
  const node = statement(ctx);
  t.snapshot(node);
});

test("break statement", t => {
  const ctx = mockContext("break;");
  ctx.globals = [{ value: "i", type: "i32" }];
  const node = statement(ctx);
  t.snapshot(node);
});
