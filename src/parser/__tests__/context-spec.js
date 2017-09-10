import test from 'ava';
import Context from '../context';

test('syntaxError generates an accurate error string', t => {
  const ctx = new Context({
    token: {
      start: { line: 1, col: 13 },
      end: { line: 1, col: 30 }
    },
    lines: ['let x: i32 = someUnknownToken;'],
    filename: 'test.walt',
    func: { id: 'test' }
  });
  const syntaxError = ctx.syntaxError('Test Error', 'unknown token');

  t.is(syntaxError instanceof SyntaxError, true);
  t.snapshot(syntaxError.toString());
});



