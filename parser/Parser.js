const { identity: I } = require('ramda');
const TokenStream = require('./TokenStream');
const Syntax = require('./Syntax');
const Node = require('./Node');

class Parser {
  constructor(tokenStream) {
    if (!(tokenStream instanceof TokenStream))
      throw `Parser expects a TokenStream instead received ${tokenStream}`;

    this.stream = tokenStream;
    this.current = null;
  }

  unexpectedValue(value, line, col) {
    return new Error(`Unexpected value at ${line}:${col}.
                      Expected ${value}`);
  }

  unexpectedToken(token, line, col) {
    return new Error(`Unexpected value at ${line}:${col}.
                      Expected ${token}`);
  }

  expect(type, value) {
    const { type: nextType, value: nextValue, start } = this.stream.peek();
    if (type !== nextType)
      throw this.unexpectedToken(type, start.line, start.col);
    if (value && value !== nextValue)
      throw this.unexpectedValue(value, start.line, start.col);
  }

  startNode() {
    const { start, end } = this.current;
    return {
      start,
      end
    };
  }

  function() {
  }

  expression() {
    this.current = this.stream.next();

    if (this.current.type === Syntax.Keyword) {

      if (this.current.value === 'let') {
        return this.parseDeclaration();
      }

      if (this.current.value === 'const') {
        return this.parseDeclaration({ isConstant: true });
      }
    }
  }

  parseDeclaration(options = {
    isConstant: false
  }) {
    this.expect(Syntax.Identifier);

    const { start } = this.startNode();
    const { value: id } = this.stream.next();

    this.expect(Syntax.Punctuator, ':');
    this.stream.next();

    this.expect(Syntax.Type);

    const { value: type, end } = this.stream.next();

    return Node.Declaration(start, end, id, type);
  }

  parseProgram() {
    const node = { type: 'program', body: [] };

    while (this.stream.peek()) {
      const child = this.expression();
      if (child)
        node.body.push(child);
    }

    return node;
  }

  parse() {
    return this.parseProgram();
  }
}

module.exports = Parser;

