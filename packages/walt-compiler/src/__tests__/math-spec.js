/**
 * Test JavaScript arithmetic operators
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Arithmetic_Operators
 */
import test from 'ava';
import { compile } from '..';

const compileAndRun = src => WebAssembly.instantiate(compile(src).buffer());
const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test('addition', t =>
  compileAndRun('export function test() : i32 { return 2 + 2; }').then(
    outputIs(t, 4)
  ));

test('subtraction', t =>
  compileAndRun('export function test(): i32 { return 4 - 2; }').then(
    outputIs(t, 2)
  ));

test('multiplication', t =>
  compileAndRun('export function test(): i32 { return 2 * 2; }').then(
    outputIs(t, 4)
  ));

test('division', t =>
  compileAndRun('export function test(): i32 { return 4 / 2; }').then(
    outputIs(t, 2)
  ));

test('remainder', t =>
  compileAndRun('export function test(): i32 { return 5 % 2; }').then(
    outputIs(t, 1)
  ));

// ** is not supported, use Math.pow(). Look into this
// test'exponentiation', t =>
//   compileAndRun('export function test(): i32 { return 2 ** 2; }').then(outputIs(t, 1))
// );

test('decrement', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 2;
    x -= 1;
    return x;
  }`).then(outputIs(t, 1)));

test('increment', t =>
  compileAndRun(`
  export function test(): i32 {
    let y: i32 = 2;
    y+=1;
    return y;
 }`).then(outputIs(t, 3)));

// Unary negation is not supported. Workaround: "return 0 - x;"
test('unary negation', t =>
  compileAndRun(`
  export function test(): i32 {
    let x: i32 = 2;
    return -x;
  }`).then(outputIs(t, -2)));

test('uses precedence correctly', t =>
  compileAndRun(`
  export function test(): i32 {
    return 2 + 2 * 5 - 10;
  }`).then(outputIs(t, 2)));

test('brackets', t =>
  compileAndRun(`
  export function test(): i32 {
    return 2 + (2 - 1);
  }`).then(outputIs(t, 3)));

test('complex brackets', t =>
  compileAndRun(`
     export function test(): i32 {
       return (2 * (3 - 1) - 1) / 3;
     }`).then(outputIs(t, 1)));

test('array index & math', t =>
  compileAndRun(`
    const memory: Memory<{ initial: 1 }>;
    export function test(): i32 {
      const x: i32[] = 0;
      x[0] = 7;
      x[0] = -x[0];
      return x[0];
    }`).then(outputIs(t, -7)));
