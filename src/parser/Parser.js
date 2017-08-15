import TokenStream from './TokenStream';
import { I32 } from '../emiter/value_type';
const { identity: I } = require('ramda');
const Syntax = require('./Syntax');
const Context = require('./Context');
const { last } = require('ramda');

function getTypeValue(typedef) {
  switch(typedef) {
    case 'i32':
      return I32;
    default:
      throw new Error('unknown type ' + typedef);
  }
}

class Parser {
  constructor(tokenStream) {
    if (!(tokenStream instanceof TokenStream))
      throw `Parser expects a TokenStream instead received ${tokenStream}`;

    this.stream = tokenStream;
    this.current = null;
    this.globalSymbols = {};
    this.localSymbols = {};
  }

  unexpectedValue(value, line, col) {
    return new Error(`Unexpected value at ${line}:${col}.
                      Expected ${value}`);
  }

  unexpected(token, line, col) {
    return new Error(`Unexpected value at ${line}:${col}.
                      Expected ${token}`);
  }

  unknown({ value, start: { line, col } }) {
    return new Error(`Unexpected token at ${line}:${col} ${value}`);
  }

  unsupported({ value, start: { line, col } }) {
    return new Error(`Language feature not supported ${line}:${col} ${value}`);
  }

  expect(type, values) {
    const { type: nextType, value: nextValue, start } = this.stream.peek();
    if (type !== nextType)
      throw this.unexpected(type, start.line, start.col);
    if (values && !values.find(v => v === nextValue))
      throw this.unexpectedValue(nextValue, start.line, start.col);
  }

  startNode() {
    const { start, end } = this.current;
    return {
      start,
      end
    };
  }

  expression(parent = { body: [] }, mark = null) {
    this.current = this.stream.next();
    mark = mark || this.startNode();

    switch(this.current.type) {
      case Syntax.Keyword:
        return this.keyword(parent, mark);
      case Syntax.Punctuator:
        return this.punctuator(parent, mark);
      case Syntax.Constant:
        return this.constant(parent, mark);
      case Syntax.Identifier:
        return this.identifier(parent, mark);
      default:
        throw this.unknown(this.current);
    }
  }

  punctuator(parent, mark) {
    switch(this.current.value) {
      case '=':
        return this.assignment(parent, mark);
      case '+':
      case '*':
      case '-':
      case '/':
      case '%':
        return this.binary(parent, mark);
      default:
        throw this.unsupported(this.current);
    }
  }

  keyword(parent, mark) {
    mark = mark || this.startNode();
    switch(this.current.value) {
      case 'let':
      case 'const':
      case 'function':
        return this.declaration(parent, mark);
      case 'export':
        this.expect(Syntax.Keyword, ['let', 'const', 'function']);
        return this.export(parent, mark);
      default:
        throw this.unsupported(this.current);
    }
  }

  export(parent, mark) {
    return {
      target: this.expression(parent, mark)
    };
  }

  assignment(parent, { start }) {
    const left = last(parent.body);
    const right = this.expression();
    const { end } = this.current;
    return {
      type: Syntax.Assignment,
      start, end, left, right
    };
  }

  binary(parent, mark) {
    const { start } = parent.body.pop();
    const operator = this.current;
    return {
      start,
      operator,
      type: Syntax.BinaryExpression,
      right: this.expression(parent)
    };
  }

  declaration(parent, { start }) {
    this.expect(Syntax.Identifier);
    const mutable = 'const' === this.current.value;
    const { value: id } = this.stream.next();

    this.expect(Syntax.Punctuator, [':']);
    this.stream.next();
    this.expect(Syntax.Type);
    const { end, value: typedef } = this.stream.next();

    return {
      type: Syntax.Declaration,
      mutable,
      id,
      start,
      end
    };
  }

  identifier(parent, { start, end }) {
    const { value: id } = this.current;
    return { type: Syntax.Identifier, start, end, id };
  }

  constant(parent, { start, end }) {
    const { value } = this.current;
    return { type: Syntax.Constant, start, end };
  }

  // Get the ast
  parseProgram() {
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!this.stream || !this.stream.length) {
      return {};
    }

    const body = [];
    const node = { body, context: new Context() };

    while (this.stream.peek()) {
      const child = this.expression(node);
      if (child)
        body.push(child);
    }

    return {
      body
    };
  }

  parse() {
    return this.parseProgram();
  }
}

module.exports = Parser;

