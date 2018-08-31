// Node Types
const Syntax = require('walt-syntax');
const { nonEmpty } = require('./helpers');

const marker = lexer => {
  debugger;
  console.log(Object.keys(lexer));
  return {
    col: lexer.col,
    line: lexer.line,
  };
};

function factory(lexer) {
  const node = (Type, seed = {}) => d => ({
    value: '',
    meta: {},
    range: [marker(lexer), marker(lexer)],
    type: null,
    ...seed,
    Type,
    params: d.filter(nonEmpty),
    toString() {},
  });

  const binary = d => {
    const [lhs, operator, rhs] = d.filter(nonEmpty);
    return {
      Type: 'BinaryExpression',
      value: operator,
      meta: [],
      params: [lhs, rhs],
    };
  };

  const constant = d => ({
    Type: 'Constant',
    value: d[0],
    meta: [],
    params: [],
  });

  const identifier = d => ({
    Type: 'Identifier',
    value: d.join(''),
    meta: [],
    params: [],
  });

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
