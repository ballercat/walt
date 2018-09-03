// Node Types
const { extendNode } = require('../../utils/extend-node');
const Syntax = require('walt-syntax');
const { nonEmpty } = require('./helpers');

const marker = lexer => {
  const { col, line } = lexer;

  if (!lexer.lines.length) {
    return { col, line, sourceLine: '' };
  }

  return {
    col,
    line,
    sourceLine: lexer.lines[lexer.line - 1],
  };
};

function drop(d = []) {
  return d.filter(nonEmpty);
}

function factory(lexer) {
  const node = (Type, seed = {}) => d => {
    const params = d.filter(nonEmpty);
    const { value = '', meta = {} } = seed;
    const start = marker(lexer);
    const end = params[params.length - 1]
      ? params[params.length - 1].range[1]
      : { ...start, col: start.col + value.length };

    return {
      value,
      type: null,
      Type,
      toString() {},
      meta,
      range: [start, end],
      params,
    };
  };

  const binary = d => {
    const [lhs, operator, rhs] = d.filter(nonEmpty);
    return node(Syntax.BinaryExpression, { value: operator.value })([lhs, rhs]);
  };

  const constant = d => {
    return extendNode(
      {
        value: d[0].value,
        type: 'i32',
      },
      node(Syntax.Constant)([])
    );
  };

  const identifier = d => node('Identifier', { value: d.join('') })([]);

  const declaration = Type => d => {
    const [pair, ...init] = drop(d);
    const [id, type] = pair.params;

    return extendNode(
      {
        value: id.value,
        type: type.value,
      },
      node(Type)(init)
    );
  };

  const statement = d => {
    return d.filter(nonEmpty);
  };

  const unary = ([operator, target]) => {
    return {
      Type: 'UnaryExpression',
      value: operator,
      meta: [],
      params: [target],
    };
  };

  const ternary = d => {
    return {
      Type: 'TernaryExpression',
      value: '?',
      meta: [],
      params: d.filter(t => nonEmpty(t) && t !== '?' && t !== ':'),
    };
  };

  const subscript = d => {
    const [id, field] = d.filter(nonEmpty);
    return {
      Type: 'ArraySubscript',
      value: identifier.value,
      meta: [],
      params: [id, field],
    };
  };

  const fun = d => {
    const [name, args, result, block] = d.filter(nonEmpty);
    return {
      ...name,
      Type: Syntax.FunctionDeclaration,
      meta: [],
      params: [args, result, block],
    };
  };

  const result = d => {
    const [type] = drop(d);

    return extendNode(
      {
        type: type != null ? type.value : null,
      },
      node(Syntax.FunctionResult)(d)
    );
  };

  const call = d => {
    const [id, ...params] = drop(d);
    return extendNode(
      {
        value: id.value,
      },
      node(Syntax.FunctionCall)(params)
    );
  };

  const struct = d => {
    const [id, ...params] = drop(d);
    debugger;
    return extendNode(
      {
        value: id.value,
      },
      node(Syntax.Struct)(params)
    );
  };

  return {
    node,
    binary,
    constant,
    identifier,
    statement,
    unary,
    ternary,
    subscript,
    fun,
    declaration,
    call,
    struct,
    result,
  };
}
module.exports = factory;
