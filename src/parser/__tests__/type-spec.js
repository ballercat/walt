import test from "ava";
import typeParser from "../type";
import { mockContext } from "../../utils/mocks";

test("type parser, object", t => {
  const ctx = mockContext("type TestType = { 'foo': i32, 'bar': i32 };");
  const node = typeParser(ctx);
  t.snapshot(node);
});

test("type parser, function type", t => {
  const ctx = mockContext("type TestFunctionType = (i32, i32) => i32;");
  const node = typeParser(ctx);
  t.snapshot(node);
});

test("type parser, empty params type", t => {
  const ctx = mockContext("type NoParamsType = () => i32;");
  const node = typeParser(ctx);
  t.snapshot(node);
});
