import test from 'ava';
import { compileAndRun } from '../utils/test-utils';

const outputIs = (t, value) => result =>
  t.is(result.instance.exports.test(), value);

test('test correct precedence', t => {
  compileAndRun(`
    export function test(): i32 {
      return 8 - 3 * 7 | 3 * 9 * 6 + 6 * 10;
    }
  `).then(outputIs(t, -1));
});

test('test correct precedence', t => {
  compileAndRun(`
    export function test(): i32 {
      return 9 - 3 ^ 10 + 6 & 1 & 6 & 6 & 10 - 9;
    }
  `).then(outputIs(t, 6));
});

test('test correct precedence with negative numbers', t => {
  compileAndRun(`
    export function test(): i32 {
      return 4 * -3 * -1 + 9 - 2 | 8 * 8 & -6 ^ 3;
    }
  `).then(outputIs(t, 83));
});

test('test correct precedence with parenthesis', t => {
  compileAndRun(`
    export function test(): i32 {
      return (1 + 1) ^ (3 * 3);
    }
  `).then(outputIs(t, 11));
});
