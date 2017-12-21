import declaration from "../declaration";
import { mockContext } from "../../utils/mocks";

test("object declaration", () => {
  const ctx = mockContext("let obj: Foo = 0;");
  ctx.func = { locals: [] };
  ctx.userTypes = [{ id: "Foo" }];
  const node = declaration(ctx);

  expect(node).toMatchSnapshot();
});

test("array declaration", () => {
  const ctx = mockContext("let arr: f32[] = 0;");
  ctx.func = { locals: [] };
  const node = declaration(ctx);
  expect(node).toMatchSnapshot();
});
