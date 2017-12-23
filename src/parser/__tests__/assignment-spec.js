import test from "ava";
import assignment from "../maybe-assignment";
import { mockContext, mockFunction } from "../../utils/mocks";

test("array assignment", t => {
  const ctx = mockFunction(mockContext("x[0] = 3488 + 458 * 122;"), {
    locals: [
      {
        value: "x",
        type: "i32",
        meta: [{ type: "type/array", payload: true }],
      },
    ],
  });
  const node = assignment(ctx);
  t.snapshot(node);
});

test("increment or decrement and assign", t => {
  const ctx = mockContext("x += 2 + 2;");
  ctx.globals = [{ value: "x", type: "i32", meta: [] }];
  const node = assignment(ctx);
  t.snapshot(node);
});
