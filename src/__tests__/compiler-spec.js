import test from "ava";
import compile from "..";

const compileAndRun = src => WebAssembly.instantiate(compile(src));

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
        return 42;
      }
    `).then(result => {
    t.is(result.instance.exports.echo(), 42);
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

test("compiles math", t =>
  compileAndRun(`
    export function test(): i32 {
      return 2 + 2 - 4;
    }
  `).then(result => t.is(result.instance.exports.test(), 0)));
