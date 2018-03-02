// @flow
import test from "ava";
import printNode from "../print-node";
import { parser, semantics } from "../..";
import compose from "../compose";

const getAST = compose(semantics, parser);

test("full ast printer", t => {
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

test("plain ast parser", t => {
  const node = parser(`
    type Type = (i32, f32) => i32;
    type Inc = Closure<Type>;

    function simple(y: i32): i32 {
      const x : i32 = 2;
      return x + y;
    }
  `);

  t.snapshot(printNode(node));
});

test("imports/exports", t => {
  const node = getAST(`
    import { foo: FooType, bar: FooType } from 'env';
    type FooType = () => i32;

    function two(): i32 {
      return 2;
    }

    export function test(): i32 {
      return foo(two() + 2);
    }`);

  t.snapshot(printNode(node));
});

test("assignment, ternary, if", t => {
  const node = getAST(`
    let x: i32 = 0;
    export function test(z: i32): i32 {
      let y: i32 = z > 0 ? 1 : 0;
      if (z == 2) {
        x = 2;
      } else {
        x = 1;
      }
      y = 1 + 1;
      return x + y;
    }
  `);

  console.log(printNode(node));
});
