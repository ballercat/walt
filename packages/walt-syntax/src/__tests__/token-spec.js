import moo from 'moo';
import test from 'ava';
import { tokens } from '..';

const src = `
// comment test
// const foo: i32 = 0;
const a = 15; // ''
lf\ncr\rcrlf\r\n
`;
test.only('tokens', () => {
  const lexer = moo.compile(tokens);
  lexer.reset(src);

  let token = lexer.next();
  const result = [];
  while (token) {
    result.push(token);
    token = lexer.next();
  }

  console.log('Result', result);
});
