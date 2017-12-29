import test from "ava";
import typeGenerator from "../type";
import typeParser from "../../parser/type";
// import printNode from "../../utils/print-node";
import { mockContext } from "../../utils/mocks";

test("type generator, type sequence params", t => {
  const ctx = mockContext("type TestFunctionType = (i32, i32) => i32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  t.snapshot(typeDef);
});

test("type generator, single type param", t => {
  // Thanks to the expression parser parens around params are optional
  const ctx = mockContext("type TestFunctionType = i32 => i32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  t.snapshot(typeDef);
});

test("type generator, void return", t => {
  const ctx = mockContext("type VoidFuncType = (i32) => void;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  t.snapshot(typeDef);
});

test("type generator, floats, 64bit types", t => {
  const ctx = mockContext("type MixedFuncType = (f32, i32, i64) => f32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  t.snapshot(typeDef);
});

test("type generator, empty params", t => {
  const ctx = mockContext("type EmptyParamsType = () => i32;");
  const node = typeParser(ctx);
  const typeDef = typeGenerator(node);
  t.snapshot(typeDef);
});
