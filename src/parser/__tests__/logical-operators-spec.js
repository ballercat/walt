import test from "ava";
import expression from "../expression";
import { mockContext } from "../../utils/mocks";

test("logical operators", t => {
  const ctx = mockContext("0 || 2");
  const node = expression(ctx);
  t.snapshot(node);
});
