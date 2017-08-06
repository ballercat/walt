import snapshot from 'snap-shot';
import {
  Tokenizer,
  Stream,
  type,
  keyword,
  constant,
  punctuator,
  identifier,
  tokenParsers
} from '../';
import Syntax from '../Syntax';
import { sources } from '../../utils/specUtils';
import test from 'ava';

test('next reads tokens, ignoring whitespace', t => {
  const tokenizer = new Tokenizer(new Stream('     global'), tokenParsers);
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
  const tokenizer = new Tokenizer(new Stream(sources.globals), tokenParsers)
  const result = tokenizer.parse();
  snapshot(result);
});
