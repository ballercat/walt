// @flow
import type { TokenType } from '../flow/types';

export type TokenStream = {
  next: () => TokenType,
  peek: () => TokenType,
  last: () => TokenType,
  tokens: TokenType[],
};

export default function tokenStream(tokens: TokenType[]): TokenStream {
  const length = tokens.length;
  let pos = 0;

  const next = () => tokens[++pos];
  const peek = () => tokens[pos + 1];
  const last = () => tokens[length - 1];

  return { pos, tokens, next, peek, last, length };
}
