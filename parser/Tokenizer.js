const Stream = require('./Stream');
const keyword = require('./keyword');
const operator = require('./operator');
const punctuation = require('./punctuation');
const identifier = require('./identifier');
const constant = require('./constant');
const type = require('./type');

class Tokenizer {

  constructor(stream, parsers = []) {
    if (!(stream instanceof Stream))
      this.die(`Tokenizer expected instance of Stream in constructor.
                Instead received ${JSON.stringify(stream)}`);
    this.stream = stream;
    this.tokens = [];
    this.pos = 0;
    this.parsers = parsers;
  }

  /**
   * Get next token
   *
   * @return {Object} token
   */
  next() {
    let value = '';
    this.seekNonWhitespace();
    let char = '';
    let parsers = this.parsers;

    do {
      if (char)
        parsers = parsers.map(parse => parse(char)).filter(p => p);
      // console.log(char, parsers.map(parser => [parser.type, parser.leaf]));
      value += char;
      char = this.stream.next();
    } while (
      !Stream.eol(char) &&
      !Stream.eof(char) &&
      !Stream.whitespace(char) &&
      char !== ';'
    );

    if (!value && char === ';') {
      value += char;
      parsers = parsers.map(parse => parse(char)).filter(p => p);
    }

    const token = this.token(value, parsers);
    this.tokens.push(token);

    return this.tokens[this.pos++];
  }

  /**
   * Match a particular non-whitespace value to a token
   *
   * @param {String} value Value to match
   * @return {Object} token
   */
  token(value, parsers, token = { type: 'unknown', value }) {
    // Strict parsers must end on a leaf node
    if (parsers.length > 1) {
      parsers = parsers.filter(parser => parser.strict ? parser.leaf : true);
      if (parsers.length > 1)
        parsers = parsers.filter(parser => parser.strict);
    }

    if (parsers.length === 1)
      token.type = parsers[0].type;

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

