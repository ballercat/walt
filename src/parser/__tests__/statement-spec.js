import statement from "../statement";
import { mockContext } from "../../utils/mocks";

test("not yet implemented keywords throw", () => {
  const ctx = mockContext("table");
  expect(() => statement(ctx)).toThrow();
});
