import test from "ava";
import sizeofParser from "../sizeof";
import { mockContext } from "../../utils/mocks";
import withMetadata from "../../metadata";
import parser from "../../parser";

test("sizeof parser, built-in type", t => {
  const ast = withMetadata(
    parser("function test() { const x: i32; sizeof(x); }")
  );
  t.snapshot(ast);
});

test.skip("sizeof parser, arrays throw", t => {
  const ctx = mockContext("sizeof(x);");
  ctx.globals = [
    { value: "x", type: "i32", meta: [{ type: "type/array" }], params: [] },
  ];

  t.throws(() => sizeofParser(ctx));
});

test("sizeof parser, user-defined object types", t => {
  const ast = withMetadata(
    parser(`
    type Type = { 'a': i32, 'b': i32, 'c': i32, 'd': i32 };
    function test() {
      const x: Type; sizeof(x);
    }`)
  );
  t.snapshot(ast);
});

test("sizeof parser, 64 bit variables", t => {
  const ast = withMetadata(
    parser("function test() { const x: i64; sizeof(x); }")
  );
  t.snapshot(ast);
});
