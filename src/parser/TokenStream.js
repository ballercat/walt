class TokenStream {
  constructor(tokens = []) {
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
}

module.exports = TokenStream;

