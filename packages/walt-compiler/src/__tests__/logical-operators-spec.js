import test from 'ava';
import { compileAndRun } from '../utils/test-utils';

const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test('logical or', t =>
  compileAndRun(`
  export function test() : i32 {
    return 0 || 2;
  }`).then(outputIs(t, 2)));

test('logical and', t =>
  compileAndRun(`
  export function test(): i32 {
    return 1 && 2;
  }`).then(outputIs(t, 2)));

test('logical or in math expression', t =>
  compileAndRun(`
  export function test(): i32 {
    return (0 || 2) + 2;
  }`).then(outputIs(t, 4)));

test('logical and in math expression', t =>
  compileAndRun(`
  export function test(): i32 {
    return (1 && 2) + 2;
  }`).then(outputIs(t, 4)));

test('precedence of logical operators in math expression', t =>
  compileAndRun(`
  export function test(): i32 {
    return 1 && 2 + 2 * 2 || 2 + 2;
  }`).then(outputIs(t, 6)));

test('chained logical operators', t =>
  compileAndRun(`
  export function test(): i32 {
    return 1 && 2 && 3;
  }`).then(outputIs(t, 3)));
