import test from 'ava';
import { compileAndRun } from '../utils/test-utils';

const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test('equal', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 0;
    return x == 0;
  }`).then(outputIs(t, 1)));

test('not equal', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 2;
    let y: i32 = x != 0;
    return y;
  }`).then(outputIs(t, 1)));

test('greater than', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 2;
    let y: i32 = 3;
    return y > x;
  }`).then(outputIs(t, 1)));

test('less than', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 3;
    let y: i32 = 2;
    return y < x;
  }`).then(outputIs(t, 1)));
