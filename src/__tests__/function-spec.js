import test from 'ava';
import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (t, value) => result => t.is(result.instance.exports.test(), value);

test('function call', t =>
  compileAndRun(`
  function two(): i32 {
    return 2;
  }
  export function test(): i32 {
    return 2 + two();
  }`)
  .then(outputIs(t, 4))
);

test('function params', t =>
  compileAndRun(`
  function addTwo(x: i32): i32 {
    return x + 2;
  }
  export function test(): i32 {
    return addTwo(2);
  }`)
  .then(outputIs(t, 4))
);

