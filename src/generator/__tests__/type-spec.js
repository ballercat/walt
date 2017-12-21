import typeGenerator from "../type";
import typeParser from "../../parser/type";
// import printNode from "../../utils/print-node";
import { mockContext } from "../../utils/mocks";

test("type generator, type sequence params", () => {
  const ctx = mockContext("type TestFunctionType = (i32, i32) => i32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  expect(typeDef).toMatchSnapshot();
});

test("type generator, single type param", () => {
  // Thanks to the expression parser parens around params are optional
  const ctx = mockContext("type TestFunctionType = i32 => i32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  expect(typeDef).toMatchSnapshot();
});

test("type generator, void return", () => {
  const ctx = mockContext("type VoidFuncType = (i32) => void;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  expect(typeDef).toMatchSnapshot();
});

test("type generator, floats, 64bit types", () => {
  const ctx = mockContext("type MixedFuncType = (f32, i32, i64) => f32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  expect(typeDef).toMatchSnapshot();
});

test("type generator, empty params", () => {
  const ctx = mockContext("type EmptyParamsType = () => i32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  expect(typeDef).toMatchSnapshot();
});
