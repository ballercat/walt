// based on https://en.wikipedia.org/wiki/LEB128#Encoding_format
import test from 'ava';
import { encodeSigned, encodeUnsigned } from '../leb128';

test('LEB128 signed encoding', t => {
  const i32Negative = encodeSigned(-624485, 32);
  t.snapshot(i32Negative.map(num => '0x' + num.toString(16).toUpperCase()));
});

test('LEB128 unsigned encoding', t => {
  const i32 = encodeUnsigned(624485, 32);
  t.snapshot(i32.map(num => '0x' + num.toString(16).toUpperCase()));
});
