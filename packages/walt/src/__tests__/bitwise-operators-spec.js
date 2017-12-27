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

test("chain bitwise and operator", t => {
  compileAndRun(`
    export function test(): i32 {
      return 15 & 7 & 2;
    }
  `).then(outputIs(t, 2));
});

test("chain bitwise or operator", t => {
  compileAndRun(`
    export function test(): i32 {
      return 8 | 4 | 2 | 1;
    }
  `).then(outputIs(t, 15));
});
