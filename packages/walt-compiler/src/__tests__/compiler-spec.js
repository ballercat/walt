import test from "ava";
import compile from "..";

const compileAndRun = (src, imports) =>
  WebAssembly.instantiate(compile(src), imports);

test("empty module compilation", t =>
  compileAndRun("").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("global declaration compilation", t =>
  compileAndRun("let answer: i32 = 42;").then(({ module, instance }) => {
    t.is(instance instanceof WebAssembly.Instance, true);
    t.is(module instanceof WebAssembly.Module, true);
  }));

test("global indexes compile correctly", t =>
  compileAndRun(
    `import { two: TwoType, alsoTwo: TwoType } from 'env';
  type TwoType = () => i32;
  const memory: Memory = { 'initial': 1 };
  const bar: i32 = 2;
  let foo: i32 = 3;
  let baz: i32 = 0;
  export function test(): i32 {
    foo = two();
    baz = alsoTwo();
    return foo + baz;
  }`,
    { env: { two: () => 2, alsoTwo: () => 2 } }
  ).then(module => t.is(module.instance.exports.test(), 4)));

test("global constant exports", t =>
  compileAndRun(`
      export const a: i32 = 42;
      export const b: f64 = 42.6;
  `).then(result => {
    t.is(result.instance.exports.a, 42);
    t.is(result.instance.exports.b, 42.6);
  }));

test("function exports", t =>
  compileAndRun(`
      export function echo() : i32 {
        return 48;
      }
    `).then(result => {
    t.is(result.instance.exports.echo(), 48);
  }));

test("function locals", t =>
  compileAndRun(`
    export function echo() : i32 {
      const x : i32 = 42;
      return x;
    }
  `).then(result => {
    t.is(result.instance.exports.echo(), 42);
  }));

test.skip("exports must have a value", t =>
  t.throws(() =>
    compileAndRun(`
  export const x: i32;
  `)
  ));

test("function scope", t =>
  compileAndRun(`
    const x : i32 = 11;
    export function test() : i32 {
      const x : i32 = 42;
      return x;
    }
  `).then(result => t.is(result.instance.exports.test(), 42)));

test("global reference in function scope", t =>
  compileAndRun(`
    const x : i32 = 42;
    export function test() : i32 {
      return x;
    }
  `).then(result => t.is(result.instance.exports.test(), 42)));

test("compiles large signed consants correctly", t =>
  compileAndRun(`
    export function test(): i32 {
      return 126;
    }
  `).then(result => t.is(result.instance.exports.test(), 126)));

test("compiles large signed global consants correctly", t =>
  compileAndRun(`
    const x: i32 = 126;
    export function test(): i32 {
      return x;
    }
  `).then(result => t.is(result.instance.exports.test(), 126)));

test("compiles math", t =>
  compileAndRun(`
    export function test(): i32 {
      return 2 + 2 - 4;
    }
  `).then(result => t.is(result.instance.exports.test(), 0)));

test("invalid imports throw", t =>
  t.throws(() => compile("import foo from 'bar'")));
