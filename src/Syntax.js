// @flow
const Syntax = {
  // Syntax Nodes
  Keyword: "Keyword",
  Export: "Export",
  Import: "Import",
  Statement: "Statement",
  IfThenElse: "IfThenElse",
  UnaryExpression: "UnaryExpression",
  BinaryExpression: "BinaryExpression",
  TernaryExpression: "TernaryExpression",
  NumberLiteral: "NumberLiteral",
  StringLiteral: "StringLiteral",
  Punctuator: "Punctuator",
  Identifier: "Identifier",
  ArraySubscript: "ArraySubscript",
  Constant: "Constant",
  Type: "Type",
  Declaration: "Declaration",
  FunctionDeclaration: "FunctionDeclaration",
  ArrayDeclaration: "ArrayDeclaration",
  IndirectFunctionCall: "IndirectFunctionCall",
  FunctionCall: "FunctionCall",
  Loop: "Loop",
  Program: "Program",
  MemoryAssignment: "MemoryAssignment",
  Assignment: "Assignment",
  Param: "Param",
  Typedef: "Typedef",
  ReturnStatement: "ReturnStatement",
  Sequence: "Sequence",
  ObjectLiteral: "ObjectLiteral",
  Pair: "Pair",
  TypeCast: "TypeCast",
  Break: "Break",

  Noop: "Noop",

  // Semantic Nodes
  FunctionIndex: "FunctionIndex",
  FunctionIdentifier: "FunctionIdentifier",
  FunctionPointer: "FunctionPointer"
};

module.exports = Syntax;
