// @flow
import type { Token } from "../flow/types";

class TokenStream {
  length: number;
  tokens: Token[];
  pos: number;

  constructor(tokens: Token[] = []) {
    this.length = tokens.length;
    this.tokens = tokens;
    this.pos = 0;
  }

  next(): Token {
    return this.tokens[this.pos++];
  }

  peek(): Token {
    return this.tokens[this.pos];
  }

  last(): Token {
    return this.tokens[this.length - 1];
  }
}

export default TokenStream;
