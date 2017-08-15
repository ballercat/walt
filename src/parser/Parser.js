import TokenStream from './TokenStream';
import { I32 } from '../emiter/value_type';
import Node from './Node';
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

  unexpectedToken(token, line, col) {
    return new Error(`Unexpected value at ${line}:${col}.
                      Expected ${token}`);
  }

  unknownToken({ value, start: { line, col } }) {
    return new Error(`Unexpected token at ${line}:${col} ${value}`);
  }

  unsupported({ value, start: { line, col } }) {
    return new Error(`Language feature not supported ${line}:${col} ${value}`);
  }

  expect(type, values) {
    const { type: nextType, value: nextValue, start } = this.stream.peek();
    if (type !== nextType)
      throw this.unexpectedToken(type, start.line, start.col);
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

  expression(parent, mark = null) {
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
        throw this.unknownToken(this.current);
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
        return this.declaration(parent, mark);
      case 'export':
        this.expect(Syntax.Keyword, ['let', 'const', 'function']);
        return Node.export(this.expression(parent, mark));
      default:
        throw this.unsupported(this.current);
    }
  }

  assignment(parent, mark) {
    const left = last(parent.body);

    if (!left.id)
      throw this.unexpectedToken(Syntax.Identifier, left.start.line, left.start.col);

    const { start } = mark;

    const right = this.expression({ context: new Context(parent.context, false), body: [] });

    const { end } = this.current;

    const node = Node.assignment(start, end, left, right);

    return node;
  }

  binary(parent, mark) {
    const left = parent.body.pop();

    const node = Node.binaryExpression(this.current, left, this.expression(parent));

    return node;
  }

  declaration(parent, mark) {
    this.expect(Syntax.Identifier);
    const decl = Node.declaration(this.current, mark)(this.stream.next());

    this.expect(Syntax.Punctuator, [':']);
    this.stream.next();
    this.expect(Syntax.Type);

    // @throws
    return parent
      .context
      .finalizeDeclaration(decl(this.stream.next()));
  }

  identifier(parent, mark) {
    const { start, end } = mark;
    const { value: id } = this.current;
    return Node.identifier(start, end, id);
  }

  constant(parent, mark) {
    const { start, end } = mark;
    const { value } = this.current;
    return Node.constant(start, end, value);
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

