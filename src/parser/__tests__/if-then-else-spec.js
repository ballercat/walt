import test from "ava";
import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("if then else, complex nested blocks", t => {
  const ctx = mockContext(
    `if (1) {
    x = 2;
  } else if (2) {
    x = 3;
  } else {
    x = 1;
    if (0) {
      x = -1;
    }
  }`
  );
  ctx.globals = [{ id: "x", type: "i32", meta: [] }];
  const node = statement(ctx);
  t.snapshot(node);
});
