import test from 'ava';
import makeParser from '..';
import { makeFragment } from '../fragment';
import print from '../../utils/print-node';

const stmt = makeFragment(makeParser([]));
const variations = [
  'a[0] = 0;',
  'a = b[0];',
  'x = a[0] + a[1];',
  'x = a[b[c[0]]];',
];

test('property access', t => {
  variations.forEach(v => t.snapshot(print(stmt`${v}`), v));
});
