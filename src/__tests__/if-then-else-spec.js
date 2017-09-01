import test from 'ava';
import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (t, value) => result => t.is(result.instance.exports.test(), value);

test.skip('if statement', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x == 0) x = 2;
    return x;
  `).then(outputIs(t, 2))
);
