import test from "ava";
import compile from "..";

const compileAndRun = (src, importsObj = {}) =>
  WebAssembly.instantiate(compile(src), importsObj);

const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test("bitwise and operator", t => {
  compileAndRun(`
    export function test(): i32 {
      return 1 & 1;
    }
  `).then(outputIs(t, 1));
});

test("bitwise or operator", t => {
  compileAndRun(`
    export function test(): i32 {
      return 0 | 0;
    }
  `).then(outputIs(t, 0));
});

test("bitwise xor operator", t => {
  compileAndRun(`
    export function test(): i32 {
      return 1 ^ 1;
    }
  `).then(outputIs(t, 0));
});

test("chain bitwise xor operator", t => {
  compileAndRun(`
    export function test(): i32 {
      return 1 ^ 1 ^ 1;
    }
  `).then(outputIs(t, 1));
});

