import test from 'ava';
import debug from '../debug';
import { getIR } from '../..';

const DEFAULT_EXAMPLE = `const x: i32 = 2;
export function echo(): i32 {
  const x: i32 = 42;
  return x;
}`;

test('debug prints web-assembly opcodes', t => {
  t.snapshot(debug(getIR(DEFAULT_EXAMPLE)));
});
