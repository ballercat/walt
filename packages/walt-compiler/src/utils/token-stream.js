// @flow
import type { TokenType } from "../flow/types";

export default class TokenStream {
  length: number;
  tokens: TokenType[];
  pos: number;

  constructor(tokens: TokenType[] = []) {
    this.length = tokens.length;
    this.tokens = tokens;
    this.pos = 0;
  }

  next(): TokenType {
    return this.tokens[this.pos++];
  }

  peek(): TokenType {
    return this.tokens[this.pos];
  }

  last(): TokenType {
    return this.tokens[this.length - 1];
  }
}
