import test from "ava";
import declaration from "../parser/declaration";
import { mockContext } from "../utils/mocks.js";

test("array declaration", t => {
  const ctx = mockContext("let x: i32[] = 0;");
  ctx.func = {
    locals: [],
  };
  debugger;
  const node = declaration(ctx);
  t.snapshot(node);
});
