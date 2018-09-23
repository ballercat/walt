import test from 'ava';
import { compileAndRun } from '../utils/test-utils';

const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test('inline if statement', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x < 2) x = 2;
    return x;
  }`).then(outputIs(t, 2)));

test('inline if else', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    if (x > 2)
      x = 0;
    else
      x = 42;
   return x;
 }`).then(outputIs(t, 42)));

test('block if statement', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 0;
    if (x < 2) {
      y = 2;
      x = y * 2;
    }
    return x;
  }`).then(outputIs(t, 4)));

test('block if else statement', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    let y: i32 = 0;
    if (x > 0) {
      y = 3;
    } else {
      y = 2;
    }
    x = y * 2;
    return x;
  }`).then(outputIs(t, 4)));

test('ternary', t =>
  compileAndRun(`
  export function test(): i32 {
    return 1 ? 42 : 24;
  }`).then(outputIs(t, 42)));

test('else if statement', () =>
  compileAndRun(`
  export function test(x: i32): i32 {
    if (x == 0) {
      x = 2;
    } else if (x == 1) {
      x = 4;
    } else {
      x = 1;
    }
    return x;
  }`).then(({ instance: { exports } }) => {
    outputIs(exports.test(0), 2);
    outputIs(exports.test(1), 4);
    outputIs(exports.test(-1), 1);
  }));

test('else if statement no curly braces', () =>
  compileAndRun(`
    export function test(x: i32): i32 {
      if (x == 0)
        x = 2;
      else if (x == 1)
        x = 4;
      else
        x = 1;
      return x;
    }`).then(({ instance: { exports } }) => {
    outputIs(exports.test(0), 2);
    outputIs(exports.test(1), 4);
    outputIs(exports.test(-1), 1);
  }));
