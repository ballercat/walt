import test from 'ava';
import makeParser from '..';
import { makeFragment } from '../fragment';
import print from '../../utils/print-node';

const stmt = makeFragment(makeParser([]));
const variations = [
  'o.a = 0;',
  'o.a[0] = 0;',
  'a.b.c.d.e.f = 0;',
  'x = a.b + c.z + y.w.i[0];',
];

test('property access', t => {
  variations.forEach(v => t.snapshot(print(stmt`${v}`), v));
});
