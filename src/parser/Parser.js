import TokenStream from './TokenStream';
import { I32 } from '../emiter/value_type';
import {
  generateExport,
  generateInit,
  generateType,
  generateCode,
  getType
} from './generator';
import Syntax from './Syntax';
import Context from './Context'
const last = list => list[list.length - 1];

// Utilities
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
};

const findTypeIndex = (node, Types) => {
  return Types.findIndex(t => {
    const paramsMatch = t.params.reduce(
      (a, v, i) => a && v === getType(node.paramList[i].type),
      true
    );

    return paramsMatch && t.result === getType(node.result.type);
  });
};

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
      `Value   : ${this.token.value}
       Expected: ${Array.isArray(value) ? value.join('|') : value}`,
      'Unexpected value'
    );
  }

  unexpected(token) {
    return this.syntaxError(
      'Unexpected token',
       `Token   : ${this.token.type}
       Expected: ${Array.isArray(token) ? token.join(' | ') : token}`
    );
  }

  unknown({ value }) {
    return this.syntaxError('Unknown token', value);
  }

  unsupported() {
    return this.syntaxError('Language feature not supported', this.token.value);
  }

  expect(value, type) {
    const token = this.token;
    if (!this.eat(value, type)) {
      throw value ? this.unexpectedValue(value) : this.unexpected(type);
    }

    return token;
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
    const token = this.token || this.stream.last();
    return Object.assign(
      node,
      {
        Type,
        end: token.end,
        range: node.range.concat(token.end)
      });
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
  expression(type, inGroup) {
    const operators = [];
    const operands = [];

    const consume = () =>
      operands.push(
        this.binary({
          type,
          operator: operators.pop(),
          operands: operands.splice(-2)
        })
      );

    while(this.token && this.token.value !== ';') {
      if (this.token.type === Syntax.Constant)
        operands.push(this.constant());
      if (this.token.type === Syntax.Identifier)
        operands.push(this.identifier());

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
    const node = Object.assign(
      this.startNode(opts.left),
      opts
    );
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
      case 'return':
        return this.returnStatement(node);
      default:
        throw this.unsupported(this.current);
    }
  }

  export(node) {
    this.eat(['export']);
    const decl = this.maybeFunctionDeclaration(this.startNode());
    if(!decl.func) {
      if(!decl.init)
        throw this.syntaxError('Exports must have a value');
    }

    this.Program.Exports.push(generateExport(decl));
    node.decl = decl;

    this.endNode(node, Syntax.Export);

    return node;
  }

  declaration(node) {
    node.const = this.token.value === 'const';
    if (!this.eat(['const', 'let']))
      throw this.unexpectedValue(['const', 'let']);

    node.id = this.expect(null, Syntax.Identifier).value;
    this.expect([':']);

    node.type = this.expect(null, Syntax.Type).value;

    if (this.eat(['=']))
      node.init = this.expression(node.type);

    if (node.const && !node.init)
      throw this.syntaxError('Constant value must be initialized');

    if (!this.func) {
      node.globalIndex = this.Program.Globals.length;
      this.Program.Globals.push(generateInit(node));
      this.globals.push(node);
    } else {
      node.localIndex = this.func.locals.length;
      this.func.locals.push(node);
    }

    return this.endNode(node, Syntax.Declaration);
  }

  maybeFunctionDeclaration(node) {
    if (!this.eat(['function']))
      return this.declaration(node);

    this.func = node;
    node.func = true;
    node.locals = [];
    node.id = this.expect(null, Syntax.Identifier).value;
    node.paramList = this.paramList();
    this.expect([':']);
    node.result = this.expect(null, Syntax.Type).value;
    this.expect(['{']);
    node.body = [];
    let stmt = null;
    while(this.token.value !== '}') {
      stmt = this.statement();
      if (stmt)
        node.body.push(stmt);
    }

    // Sanity check the return statement
    const ret = last(node.body);
    if (ret) {
      if(node.type === 'void' && ret.Type === Syntax.ReturnStatement)
        throw this.syntaxError('Unexpected return value in a function with result : void');
      if(node.type !== 'void' && ret.Type !== Syntax.ReturnStatement)
        throw this.syntaxError('Expected a return value in a function with result : ' + node.result);
    } else if (node.result){
      throw this.syntaxError(`Return type expected ${node.result}, received ${JSON.stringify(ret)}`);
    }

    // Either re-use an existing type or write a new one
    const typeIndex = findTypeIndex(node, this.Program.Types);
    if(typeIndex !== -1) {
      node.typeIndex = typeIndex;
    } else {
      node.typeIndex = this.Program.Types.length;
      this.Program.Types.push(generateType(node));
    }

    // attach to a type index
    node.functionIndex = this.Program.Functions.length;
    this.Program.Functions.push(node.typeIndex);

    // generate the code block for the emiter
    this.Program.Code.push(generateCode(node));

    this.expect(['}']);
    this.func = null;

    return this.endNode(node, Syntax.FunctionDeclaration);
  }

  paramList() {
    const paramList = [];
    this.expect(['(']);
    while(this.token.value !== ')')
      paramList.push(this.param());
    this.expect([')']);
    return paramList;
  }

  param(node = this.startNode()) {
    node.id = this.expect(null, Syntax.Identifier).value;
    this.expect([':']);
    node.type = this.expect(null, Syntax.Type).value;
    return this.endNode(node, Syntax.Param);
  }

  returnStatement(node = this.startNode()) {
    if(!this.func)
      throw this.syntaxError('Return statement is only valid inside a function');
    this.expect(['return']);
    node.expr = this.expression(this.func.result);

    // For generator to emit correct consant they must have a correct type
    // in the syntax it's not necessary to define the type since we can infer it here
    if (node.expr.type && this.func.result !== node.expr.type)
      throw this.syntaxError('Return type mismatch');
    else if(!node.expr.type && this.func.result)
      node.expr.type = this.func.result;

    return this.endNode(node, Syntax.ReturnStatement);
  }

  constant(token = this.token) {
    const node = this.startNode();
    node.value = token.value;
    return this.endNode(node, Syntax.Constant);
  }

  identifier(token = this.token) {
    const node = this.startNode();
    let target = this.func.locals.findIndex(l => l.id === this.token.value);
    if (target !== -1) {
      node.localIndex = target;
      node.target = this.func.locals[target];
    } else {
      node.globalIndex = this.globals.findIndex(g => g.id === this.token.value);
      node.target = this.globals[node.globalIndex];
    }

    return this.endNode(node, Syntax.Identifier);
  }

  // Get the ast
  program() {
    // No code, no problem, empty ast equals
    // (module) ; the most basic wasm module
    if (!this.stream || !this.stream.length) {
      return {};
    }

    this.globals = [];
    const node = this.Program = this.startNode();

    // Setup keys needed for the emiter
    this.Program.Types = [];
    this.Program.Code = [];
    this.Program.Exports = [];
    this.Program.Imports = [];
    this.Program.Globals = [];
    this.Program.Functions = [];

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

export default Parser;

