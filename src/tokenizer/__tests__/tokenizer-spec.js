import snapshot from 'snap-shot';
import Tokenizer from '..';
import Stream from '../../utils/stream';
import Syntax from '../../Syntax';
import test from 'ava';

test('next reads tokens, ignoring whitespace', t => {
  const tokenizer = new Tokenizer(new Stream('     global'));
  t.deepEqual(tokenizer.next(), {
    type: Syntax.Keyword,
    value: 'global',
    end: {
      col: 11,
      line: 1
    },
    start: {
      col: 5,
      line: 1
    }
  });
});


test('parses a stream into tokens', t => {
  const stream = new Stream(`let x: i32 = 2;`);
  const tokenizer = new Tokenizer(stream);
  const result = tokenizer.parse();
  snapshot(result);
});
