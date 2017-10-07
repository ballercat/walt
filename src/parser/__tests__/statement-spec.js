import test from "ava";
import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("not yet implemented keywords throw", t => {
  const ctx = mockContext("table");
  t.throws(() => statement(ctx));
});
