// @flow
import Stream from "../utils/stream";
import punctuator from "./punctuator";
import constant from "./constant";
import identifier from "./identifier";
import keyword from "./keyword";
import string from "./string";
import comments from "./comments";
import type from "./type";

type Parsers = ((string) => any)[];

class Tokenizer {
  stream: Stream;
  tokens: Array<any>;
  pos: number;
  parsers: Parsers;

  constructor(
    stream: Stream,
    parsers: Parsers = [
      punctuator,
      constant,
      identifier,
      keyword,
      string,
      type,
      comments,
    ]
  ) {
    this.stream = stream;
    this.tokens = [];
    this.pos = 0;
    this.parsers = parsers;
  }

  /**
   * Get next token
   */
  next() {
    let value = "";
    this.seekNonWhitespace();
    let char = "";
    let matchers = this.parsers;
    let next;
    let nextMatchers = this.match(char, matchers);
    let start = {
      sourceLine: this.stream.lines[this.stream.line - 1],
      line: this.stream.line,
      col: this.stream.col,
    };

    do {
      char = this.stream.peek();
      matchers = this.match(char, matchers);
      value += char;
      this.stream.next();
      next = this.stream.peek();
      nextMatchers = this.match(next, matchers);
    } while (!Stream.eof(next) && nextMatchers.length > 0);

    // If we fell off the end then bail out
    if (Stream.eof(value)) {
      return null;
    }

    const token = this.token(value, matchers);
    token.start = start;
    token.end = {
      sourceLine: this.stream.lines[this.stream.line - 1],
      line: this.stream.line,
      col: this.stream.col,
    };
    // Comments are ignored for now
    if (token.type !== comments.type) {
      this.tokens.push(token);
    }

    return this.tokens[this.pos++];
  }

  match(char: string, parsers: Parsers) {
    return parsers.map(parse => parse(char)).filter(p => p);
  }

  /**
   * Match a particular non-whitespace value to a token
   */
  token(
    value: string,
    parsers: Parsers,
    token: { type: string, value: string, start: {}, end: {} } = {
      type: "unknown",
      value,
      start: {},
      end: {},
    }
  ) {
    // Strict parsers must end on a leaf node
    if (parsers.length > 1) {
      parsers = parsers.filter(parser => (parser.strict ? parser.leaf : true));
      if (parsers.length > 1) {
        parsers = parsers.filter(parser => parser.strict);
      }
    }

    if (parsers.length === 1) {
      token.type = parsers[0].type;
    }

    return token;
  }

  /**
   * Seek Stream until next non-whitespace character. Can end in eof/eol
   */
  seekNonWhitespace() {
    while (this.stream.peek() && Stream.whitespace(this.stream.peek())) {
      this.stream.next();
    }
  }

  parse() {
    while (!Stream.eof(this.stream.peek())) {
      this.next();
    }

    return this.tokens;
  }
}

export default Tokenizer;
