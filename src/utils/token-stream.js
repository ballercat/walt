class TokenStream {
  constructor(tokens = []) {
    this.length = tokens.length;
    this.tokens = tokens;
    this.pos = 0;
  }

  next() {
    return this.tokens[this.pos++];
  }

  peek() {
    return this.tokens[this.pos];
  }

  seek(relative) {
    this.pos = relative;
    return this.tokens[this.pos];
  }

  last() {
    return this.tokens[this.length - 1];
  }
}

export default TokenStream;

