import test from "ava";
import parser from "../../parser";
import semantics from "..";
// import printNode from "../../utils/print-node";

test("identifiers as properties", t => {
  const ast = semantics(
    parser(`
     type TestType = { foo: f32, bar: i32 };
     export function test() {
       let obj: TestType = 0;
       obj = { foo: 42.0, bar: 10 };
     }
    `)
  );
  t.snapshot(ast);
});
