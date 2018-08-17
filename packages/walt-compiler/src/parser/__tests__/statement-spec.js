import test from 'ava';
import { statementFramgent as statement } from '../../parser/fragment';

test('not yet implemented keywords throw', t => {
  t.throws(() => statement('table'));
});

test('expressions where a statment should be, throw', t =>
  t.throws(() => statement('=')));

test('unsupported keywords throw', t => t.throws(() => statement('assert')));
