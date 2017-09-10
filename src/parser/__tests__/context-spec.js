import test from 'ava';
import Context from '../context';

test('syntaxError generates an accurate error string', t => {
  const ctx = new Context({
    token: {
      start: { line: 24, col: 42 }
    },
    filename: 'test.walt',
    func: { id: 'test' }
  });
  const syntaxError = ctx.syntaxError('Test Error');
  t.is(syntaxError instanceof SyntaxError, true);
  const lines = syntaxError.toString().split('\n');
  t.snapshot(lines);
});

