import test from 'ava';
import compile from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src));
const outputIs = (t, value) => result => t.is(result.instance.exports.test(), value);

test('declration assignment', t =>
  compileAndRun('export function test(): i32 { let x: i32 = 2; return x; }')
    .then(outputIs(t, 2))
);

test('assigment statement', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 2;
    x = y + 2;
    return x;
  }`).then(outputIs(t, 4))
);

