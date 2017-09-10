import test from 'ava';
import compile from '..';

const compileAndRun = (src, importsObj = {}) => WebAssembly.instantiate(compile(src), importsObj);
const outputIs = (t, value, input) => result => t.is(result.instance.exports.test(input), value);

test('for loop', t =>
  compileAndRun(`
  export function test(x: i32): i32 {
    let y: i32 = 0;
    let i: i32 = 0;
    for(y = 0; y <= x; y = y + 1) {
      i = 0 - y;
    }
    return i;
  }
  `).then(outputIs(t, -41, 42))
);

test('while loop', t =>
  compileAndRun(`
  export function test(x: i32): i32 {
    let y: i32 = 0;
    let i: i32 = 0;
    while(y <= x) {
      y = y + 1;
      i = 0 - y;
    }
    return i;
  }
  `).then(outputIs(t, -42, 42))
);

