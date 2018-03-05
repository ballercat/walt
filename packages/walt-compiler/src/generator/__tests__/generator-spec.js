import test from "ava";
import generator from "..";
import parser from "../../parser";
import semantics from "../../semantics";

test("returns a valid Program", t => {
  const ast = parser("");
  const program = generator(ast);

  t.truthy(Array.isArray(program.Types));
  t.truthy(Array.isArray(program.Code));
  t.truthy(Array.isArray(program.Exports));
  t.truthy(Array.isArray(program.Imports));
  t.truthy(Array.isArray(program.Globals));
  t.truthy(Array.isArray(program.Element));
  t.truthy(Array.isArray(program.Functions));
  t.truthy(Array.isArray(program.Memory));
  t.truthy(Array.isArray(program.Table));
});

test("generates globals", t => {
  const ast = parser(`const x: i32 = 42;
  const y: i64 = 4200000;
  let mutableX: i32 = 0;
  let mutableY: i64 = 0;
  const fx: f32 = 42;
  const fy: f64 = 4200000;
  let mutableFX: f32 = 0;
  let mutableFY: f64 = 0;
  `);
  const program = generator(ast);
  t.snapshot(program);
});

test("generates memory declaration", t => {
  const ast = parser("const memory: Memory<{initial: 1, max: 10}>;");
  const program = generator(semantics(ast));
  t.snapshot(program);
});

test("generates table declaration", t => {
  const ast = parser(
    "const table: Table = {'initial': 1, 'max': 10, 'element': 'anyfunc'};"
  );
  const program = generator(semantics(ast));
  t.snapshot(program);
});

test("generates scalar exports", t => {
  const ast = parser("export const x: i32 = 42;");
  const program = generator(semantics(ast));
  t.snapshot(program);
});

test("generates scalar imports", t => {
  const ast = parser("import { foobar: i32 } from 'env';");
  const program = generator(semantics(ast));
  t.snapshot(program);
});

test("function declaration", t => {
  const ast = parser(`function test(): i32 {
    return 42;
  }`);
  const program = generator(semantics(ast));
  t.snapshot(program);
});

test("function calls", t => {
  const ast = parser(`
  function addTwo(x: i32): i32 {
    return x + 2;
  }
  function test(): i32 {
    return addTwo(2);
  }`);
  const program = generator(semantics(ast));
  t.snapshot(program);
});
