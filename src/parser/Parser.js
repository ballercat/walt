import TokenStream from './TokenStream';
import { I32 } from '../emiter/value_type';
const { identity: I } = require('ramda');
const Syntax = require('./Syntax');
const Node = require('./Node');
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

  expression(parent, mark = null) {
    this.current = this.stream.next();
    mark = mark || this.startNode();

    if (this.current.type === Syntax.Keyword) {

      if (this.current.value === 'let')
        return this.parseDeclaration(parent, mark);

      if (this.current.value === 'const')
        return this.parseDeclaration(parent, mark, { isConstant: true });
    }

    if (this.current.type === Syntax.Punctuator) {

      switch(this.current.value) {
        case '=':
          return this.parseAssignment(parent, mark);
        case '+':
        case '*':
        case '-':
        case '/':
        case '%':
          return this.parseBinary(parent, mark);
        default:
          throw this.unsupported(this.current);
      }
    }

    if (this.current.type === Syntax.Constant) {
      return this.parseConstant(parent, mark);
    }

    if (this.current.type === Syntax.Identifier) {
      return this.parseIdentifier(parent, mark);
    }

    throw this.unknownToken(this.current);
  }

  parseAssignment(parent, mark) {
    const left = last(parent.body);

    if (!left.id)
      throw this.unexpectedToken(Syntax.Identifier, left.start.line, left.start.col);

    const { start } = mark;

    const right = this.expression({ context: new Context(parent.context, false), body: [] });

    const { end } = this.current;

    const node = Node.assignment(start, end, left, right);

    if (node.left.isGlobal) {
      const entry = this.Globals.find(({ id }) => id === node.left.id);

      switch(node.right.type) {
        case 'Constant':
          entry.init = parseInt(node.right.value);
      }
    }

    return node;
  }

  /**
   * TODO: combine this and assignment
   * @throws
   */
  parseBinary(parent, mark) {
    const left = parent.body.pop();

    const node = Node.binaryExpression(this.current, left, this.expression(parent));

    return node;
  }

  /**
   * @throws
   */
  parseDeclaration(parent, mark, options = {
    isConstant: false
  }) {
    this.expect(Syntax.Identifier);

    const { start } = mark;
    const { value: id } = this.stream.next();

    this.expect(Syntax.Punctuator, ':');
    this.stream.next();

    this.expect(Syntax.Type);

    const { value: type, end } = this.stream.next();

    const decl = Node.declaration(start, end, id, type);

    // @throws
    parent.context.finalizeDeclaration(decl);
    decl.isConstant = options.isConstant;

    if (decl.isGlobal) {
      this.writeGlobal({
        mutable: +(!decl.isConstant),
        type: getTypeValue(decl.typedef),
        id: decl.id
      });
    }

    return decl;
  }

  parseIdentifier(parent, mark) {
    const { start, end } = mark;
    const { value: id } = this.current;
    return Node.identifier(start, end, id);
  }

  parseConstant(parent, mark) {
    const { start, end } = mark;
    const { value } = this.current;
    return Node.constant(start, end, value);
  }

  // mutable, type, id, init(node)
  writeGlobal(entry) {
    this.Globals.push(entry);
  }

  // Get the ast
  parseProgram() {
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!this.stream || !this.stream.length) {
      return {};
    }

    this.Globals = [];

    const body = [];
    const node = { body, context: new Context() };

    while (this.stream.peek()) {
      const child = this.expression(node);
      if (child)
        body.push(child);
    }

    return {
      Globals: this.Globals
    };
  }

  parse() {
    return this.parseProgram();
  }
}

module.exports = Parser;

