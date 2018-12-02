import test from 'ava';
import { makeFragment } from '../fragment';
import print from '../../utils/print-node';
import makeParser from '..';

test('simple string replacement', t => {
  const stmt = makeFragment(makeParser([]));
  const type = 'i32';
  const value = '0';
  const node = stmt`const x : ${type} = ${value};`;
  t.snapshot(print(node));
});

test('node replacement', t => {
  const stmt = makeFragment(makeParser([]));
  const value = stmt`__fcall(2, 4, 5 + 5);`;
  const node = stmt`const x : i32 = ${value};`;
  t.snapshot(print(node));
});

test('multiple node replacements', t => {
  const stmt = makeFragment(makeParser([]));
  const a = stmt`__fcall(2, 4, 5 + 5);`;
  const b = stmt`(x + y);`;
  const node = stmt`const x : i32 = ${a} + ${b};`;
  t.snapshot(print(node));
});

test('mixed replacements', t => {
  const stmt = makeFragment(makeParser([]));
  const a = '__fcall(2, 4, 5 + 5)';
  const b = 42;
  const c = stmt`(x + y);`;
  const node = stmt`const x : i32 = ${a} + ${b} + ${c};`;
  t.snapshot(print(node));
});
