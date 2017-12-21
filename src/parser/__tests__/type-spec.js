import typeParser from "../type";
import { mockContext } from "../../utils/mocks";

test("type parser, object", () => {
  const ctx = mockContext("type TestType = { 'foo': i32, 'bar': i32 };");
  const node = typeParser(ctx);
  expect(node).toMatchSnapshot();
});

test("type parser, function type", () => {
  const ctx = mockContext("type TestFunctionType = (i32, i32) => i32;");
  const node = typeParser(ctx);
  expect(node).toMatchSnapshot();
});

test("type parser, empty params type", () => {
  const ctx = mockContext("type NoParamsType = () => i32;");
  const node = typeParser(ctx);
  expect(node).toMatchSnapshot();
});
