import test from 'ava';
import { compile } from '..';

const compileAndRun = (src, importsObj = {}) =>
  WebAssembly.instantiate(compile(src).buffer(), importsObj);
const outputIs = (t, value, input) => result =>
  t.is(result.instance.exports.test(input), value);

test('for loop params', t =>
  compileAndRun(
    `export function test(): i32 {
  let i: i32 = 10;
  let x: i32 = 0;
  for(i = 0; i < 3; i += 1) {
    x += i;
  }
  return x;
}`
  ).then(outputIs(t, 3)));

test('for loop', t =>
  compileAndRun(`
  export function test(x: i32): i32 {
    let y: i32 = 1;
    let i: i32 = 0;
    for(y = 0; y <= x; y += 1) {
      i = 0 - y;
    }
    return i;
  }
  `).then(outputIs(t, -5, 5)));

test('while loop', t =>
  compileAndRun(`
  export function test(x: i32): i32 {
    let y: i32 = 0;
    let i: i32 = 0;
    while(y != x) {
      i -= y;
      y += 1;
    }
    return i;
  }
  `).then(outputIs(t, -10, 5)));

test('break', t => {
  return compileAndRun(
    `export function test() : i32 {
  let i: i32 = 0;
  let k: i32 = 0;
  for(i = 0; i < 10; i += 1) {
    if (i == 5) {
      break;
    }
  }
  return i;
}
`
  ).then(outputIs(t, 5));
});
