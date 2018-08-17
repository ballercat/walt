import test from 'ava';
import {
  getTypeString,
  I32,
  I64,
  F32,
  F64,
  FUNC,
  ANYFUNC,
} from '../value_type';

test('getTypeString returns string version of the constant', t => {
  t.snapshot(getTypeString(I32));
  t.snapshot(getTypeString(F32));
  t.snapshot(getTypeString(I64));
  t.snapshot(getTypeString(F64));
  t.snapshot(getTypeString(FUNC));
  t.snapshot(getTypeString(ANYFUNC));
});
