import TokenStream from './TokenStream';
import { I32 } from '../emiter/value_type';
import {
  generateExport,
  generateGlobal
} from './generator';
import Syntax from './Syntax';
import Context from './Context'
import { last } from 'ramda';

const precedence = {
  '+': 0,
  '-': 0,
  '*': 1,
  '/': 1
};

const assoc = op => {
  switch(op) {
    case '+':
    case '-':
    case '/':
    case '*':
      return 'left';
    case '=':
      return 'right';
    default:
      return 'left';
  }
}

class Parser {
  constructor(tokenStream) {
    if (!(tokenStream instanceof TokenStream))
      throw `Parser expects a TokenStream instead received ${tokenStream}`;

    this.stream = tokenStream;
    this.token = this.stream.next();
    this.globalSymbols = {};
    this.localSymbols = {};
  }

  syntaxError(msg, error) {
    const { line, col } = this.token.start;
    return new SyntaxError(
      `${error || 'Syntax error'} at ${line}:${col}
      ${msg}`
    );
  }

  unexpectedValue(value) {
    return this.syntaxError(
      'Unexpected value',
      `Value   : ${this.token.value}
       Expected: ${Array.isArray(value) ? value.join('|') : value}`
    );
  }

  unexpected(token) {
    return this.syntaxError(
      'Unexpected token',
       `Token   : ${this.token.type}
       Expected: ${token}`
    );
  }

  unknown({ value }) {
    return this.syntaxError('Unknown token', value);
  }

  unsupported() {
    return this.syntaxError('Language feature not supported', this.token.value);
  }

  expect(type, values) {
    const { type: nextType, value: nextValue, start } = this.stream.peek();
    if (type !== nextType)
      throw this.unexpected(type, start.line, start.col);
    if (values && !values.find(v => v === nextValue))
      throw this.unexpectedValue(nextValue, start.line, start.col);
  }

  next() {
    this.token = this.stream.next();
  }

  eat(value, type) {
    if (value) {
      if (value.includes(this.token.value)) {
        this.next();
        return true;
      }
      return false;
    }

    if (this.token.type === type) {
      this.next();
      return true;
    }

    return false;
  }

  startNode(token = this.token) {
    return { start: token.start, range: [token.start] };
  }

  endNode(node, Type) {
    return {
      ...node,
      Type,
      end: this.token.end,
      range: node.range.concat(this.token.end)
    };
  }

  statement(node = this.startNode()) {
    switch(this.token.type) {
      case Syntax.Keyword:
        return this.keyword(node);
      case Syntax.Punctuator:
        if (this.eat([';']))
          return null;
      default:
        throw this.unknown();
    }
  }

  // Simplified version of the Shunting yard algorithm
  expression(node = this.startNode(), inGroup) {
    const operators = [];
    const operands = [];

    const consume = () =>
      operands.push(
        this.binary({
          operator: operators.pop(),
          right: operands.pop(),
          left: operands.pop()
        })
      );

    while(this.token && this.token.value !== ';') {
      if (this.token.type === Syntax.Constant)
        operands.push(this.constant());

      if (this.token.type === Syntax.Punctuator) {
        while(last(operators)
          && precedence[last(operators).value] >= precedence[this.token.type]
          && assoc(last(operators).value) === 'left'
        ) consume();

        operators.push(this.token);
      }
      // TODO "("
      // TODO ")"
      this.next();
    };


    while(operators.length)
      consume();

    // Should be a node
    return operands.pop();
  }

  binary(opts) {
    const node = {
      ...this.startNode(opts.left),
      ...opts
    };
    return this.endNode(node, Syntax.BinaryExpression);
  }

  keyword(node) {
    switch(this.token.value) {
      case 'let':
      case 'const':
        return this.declaration(node);
      case 'function':
        return this.functionDeclaration(node);
      case 'export':
        return this.export(node);
      default:
        throw this.unsupported(this.current);
    }
  }

  export(node) {
    this.eat(['export']);
    const decl = this.declaration(this.startNode());
    if (!decl.init)
      throw this.syntaxError('Exports must have a value');

    node.decl = decl;

    this.endNode(node, Syntax.Export);
    this.Program.Exports.push(generateExport(node));

    return node;
  }

  declaration(node, inFunction) {
    node.const = this.token.value === 'const';
    if (!this.eat(['const', 'let']))
      throw this.unexpectedValue(['const', 'let']);

    node.id = this.token.value
    if (!this.eat(null, Syntax.Identifier))
      throw this.unexpected(Syntax.Identifier);

    if (!this.eat([':']))
      throw this.unexpectedValue(':');

    node.type = this.token.value;
    if (!this.eat(null, Syntax.Type))
      throw this.unexpected(Syntax.Type);

    if (this.eat(['=']))
      node.init = this.expression();

    if (node.const && !node.init)
      throw this.syntaxError('Constant value must be initialized');

    if (!inFunction) {
      node.globalIndex = this.Program.Globals.length;
      this.Program.Globals.push(generateGlobal(node));
    }

    return this.endNode(node, Syntax.Declaration);
  }

  functionDeclaration(node) {
  }

  identifier(node) {
  }

  constant(token = this.token) {
    const node = this.startNode();
    node.value = token.value;
    return this.endNode(node, Syntax.Constant);
  }

  // Get the ast
  program() {
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!this.stream || !this.stream.length) {
      return {};
    }

    const node = this.Program = this.startNode();
    this.Program.Exports = [];
    this.Program.Imports = [];
    this.Program.Globals = [];

    node.body = [];
    while (this.stream.peek()) {
      const child = this.statement();
      if (child)
        node.body.push(child);
    }

    return node;
  }

  parse() {
    return this.program();
  }
}

module.exports = Parser;

