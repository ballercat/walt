import test from 'ava';
import Syntax from '..';

test('Walt Syntax Definitions', t => {
  t.is(!!Syntax && typeof Syntax === 'object', true);
});

test('Node types are all strings', t => {
  const typesOnly = Object.entries(Syntax).filter(
    ([k]) => !['statements', 'builtinTypes'].includes(k)
  );
  t.is(
    // Every Definde Type is a non empty string
    typesOnly.every(
      ([, value]) => typeof value === 'string' && value.trim().length
    ),
    true
  );
});
