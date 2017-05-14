const Stream = require('./Stream');
const keyword = require('./keyword');
const operator = require('./operator');
const punctuation = require('./punctuation');
const identifier = require('./identifier');
const constant = require('./constant');
const type = require('./type');

class Tokenizer {

  constructor(stream) {
    if (!(stream instanceof Stream))
      this.die(`Tokenizer expected instance of Stream in constructor.
                Instead received ${JSON.stringify(stream)}`);
    this.stream = stream;
    this.tokens = [];
    this.pos = 0;
  }

  /**
   * Get next token
   *
   * @return {Object} token
   */
  next() {
    let value = '';
    this.seekNonWhitespace();
    let char = this.stream.next();
    while (
      !Stream.eol(char) &&
      !Stream.eof(char) &&
      !Stream.whitespace(char)
    ) {
      value += char;
      char = this.stream.next();
    }

    this.tokens.push(this.token(value));

    return this.tokens[this.pos++];
  }

  /**
   * Match a particular non-whitespace value to a token
   *
   * @param {String} value Value to match
   * @return {Object} token
   */
  token(value) {
    const token = { type: 'unknown', value };

    if (keyword.is(value)) {
      token.type = keyword.type;
    } else if (operator.is(value)) {
      token.type = operator.type;
    } else if (punctuation.is(value)) {
      token.type = punctuation.type;
    } else if (type.is(value)) {
      token.type = type.type;
    } else if (constant.is(value)) {
      token.type = constant.type;
    } else if (identifier.is(value)) {
      token.type = identifier.type;
    }

    return token;
  }

  /**
   * Seek Stream until next non-whitespace character. Can end in eof/eol
   */
  seekNonWhitespace() {
    while (Stream.whitespace(this.stream.peek())) this.stream.next();
  }

  parse() {
    while (
      !Stream.eol(this.stream.peek()) &&
      !Stream.eof(this.stream.peek())
    ) {
      this.next();
    }

    return this.tokens;
  }
}

module.exports = Tokenizer;

