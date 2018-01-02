import test from "ava";
import sizeofParser from "../sizeof";
import { mockContext } from "../../utils/mocks";
import semantics from "../../semantics";
import parser from "../../parser";

test("sizeof parser, built-in type", t => {
  const ast = semantics(parser("function test() { const x: i32; sizeof(x); }"));
  t.snapshot(ast);
});

test("sizeof parser, user-defined object types", t => {
  const ast = semantics(
    parser(`
    type Type = { 'a': i32, 'b': i32, 'c': i32, 'd': i32 };
    function test() {
      const x: Type; sizeof(x);
    }`)
  );
  t.snapshot(ast);
});

test("sizeof parser, 64 bit variables", t => {
  const ast = semantics(parser("function test() { const x: i64; sizeof(x); }"));
  t.snapshot(ast);
});
