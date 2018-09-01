// Node Types
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
    return {
      Type: 'BinaryExpression',
      value: operator,
      meta: [],
      params: [lhs, rhs],
    };
  };

  const constant = d => node('Constant', { value: d[0].value })([]);

  const identifier = d => node('Identifier', { value: d.join('') })([]);

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
    const [identifier, field] = d.filter(nonEmpty);
    return {
      Type: 'ArraySubscript',
      value: identifier.value,
      meta: [],
      params: [identifier, field],
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
  };
}
module.exports = factory;
