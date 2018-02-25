// @flow
import test from "ava";
import printNode from "../print-node";
import { parser, semantics } from "../..";
import compose from "../compose";

const getAST = compose(semantics, parser);

test("print-node", t => {
  const node = getAST(`
    function simple(): i32 {
      const x: i32 = 1 + 1;
      const y: i32 = 2;
      return x + y;
    }
    function multiple_args(x: i32, y: f32): f32 {
      return x + y;
    }
    function arrays(): i32 {
      const x: i32[] = 0;
      x[0] = 2;
      x[1] = 2;
      return x[0] + x[1];
    }
  `);

  t.snapshot(printNode(node));
});
