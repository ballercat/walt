import test from "ava";
import parser from "../../parser";
import withMetadata from "..";
import printNode from "../../utils/print-node";

test("function declarations", t => {
  const ast = parser(`
  function one() {
  }
  function two(x: i32) {
  }`);
  const astWithMetadata = withMetadata(ast);
});

test("globals", t => {
  const ast = parser(`const x: i32 = 0;
  let y: f64 = 0.0;
  `);
  const astWithMetadata = withMetadata(ast);
});

test("imports", t => {
  const ast = parser(`import { foo: FooType } from 'env';
  type FooType = () => i32;
  `);
  const astWithMetadata = withMetadata(ast);
});

test("identifiers", t => {
  const ast = parser(`
  const x: i32 = 0;
  function test(): i32 {
    let y: i32 = x;
    let x: i32 = 1;
    return 2 + x;
  }`);
  const astWithMetadata = withMetadata(ast);
});

test.only("function calls", t => {
  const ast = parser(`
  function addTwo(x: i32): i32 {
    return x + 2;
  }
  function test(): i32 {
    return addTwo(2);
  }`);
  const astWithMetadata = withMetadata(ast);
  console.log(printNode(astWithMetadata));
});
