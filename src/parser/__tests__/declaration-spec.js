import test from "ava";
import declaration from "../declaration";
import { mockContext } from "../../utils/mocks";

test.skip("object declaration", t => {
  const ctx = mockContext("let obj: Foo = 0;");
  ctx.func = { locals: [] };
  ctx.userTypes = [{ id: "Foo" }];
  const node = declaration(ctx);

  t.snapshot(node);
});
