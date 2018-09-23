import test from 'ava';
import { compileAndRun } from '../utils/test-utils';

test('bitwise operators', t => {
  return compileAndRun(`
    export function testAnd(): i32 {
      return 1 & 1;
    }

    export function testOr(): i32 {
      return 0 | 0;
    }

    export function testXor(): i32 {
      return 1 ^ 1 ^ 1;
    }

    export function testZeroFillShiftRight(): i32 {
      return -9 >>> 2;
    }

    export function testStickyRightShift(): i32 {
      return -9 >> 2;
    }
  `).then(({ instance: { exports } }) => {
    t.is(exports.testAnd(), 1);
    t.is(exports.testOr(), 0);
    t.is(exports.testXor(), 1);
    t.is(exports.testZeroFillShiftRight(), 1073741821);
    t.is(exports.testStickyRightShift(), -3);
  });
});
