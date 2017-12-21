import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("while parser", () => {
  const ctx = mockContext("while (x < 10) { x += 1; }");
  ctx.globals = [{ id: "x", type: "i32" }];
  const node = statement(ctx);
  expect(node).toMatchSnapshot();
});

test("for loop parser", () => {
  const ctx = mockContext("for(i = 0; i < 10; i += 1){ x += i; }");
  ctx.globals = [{ id: "x", type: "i32" }, { id: "i", type: "i32" }];
  const node = statement(ctx);
  expect(node).toMatchSnapshot();
});

test("break statement", () => {
  const ctx = mockContext("break;");
  ctx.globals = [{ id: "i", type: "i32" }];
  const node = statement(ctx);
  expect(node).toMatchSnapshot();
});
