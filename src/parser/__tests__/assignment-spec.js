import test from "ava";
import assignment from "../maybe-assignment";
import { mockContext } from "../../utils/mocks";

test("array assignment", t => {
  const ctx = mockContext("x[0] = 3488 + 458 * 122;");
  ctx.func = {
    locals: [
      {
        id: "x",
        meta: [{ type: "type/array", payload: true }]
      }
    ]
  };
  const node = assignment(ctx);
  t.snapshot(node);
});
